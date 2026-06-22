import mongoose from "mongoose";
import crypto from "crypto";
import zlib from "zlib";
import { PassThrough } from "stream";
import BackupJob from "@/models/BackupJob";
import BackupConfig from "@/models/BackupConfig";
import BackupSnapshot from "@/models/BackupSnapshot";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Review from "@/models/Review";
import User from "@/models/User";
import OwnerSetting from "@/models/OwnerSetting";
import Notification from "@/models/Notification";
import { getBackupStorage } from "./storage";

const SCHEMA_VERSION = "1.0.0";

class JSONStreamWriter {
  constructor(private stream: PassThrough, private hash: crypto.Hash) {}

  write(chunk: string) {
    this.hash.update(chunk);
    this.stream.write(chunk);
  }

  async writeCursor(cursor: any, collectionName: string, isFirstCollection: boolean, stripFn?: (doc: any) => any) {
    if (!isFirstCollection) {
      this.write(`,\n"${collectionName}": [`);
    } else {
      this.write(`\n"${collectionName}": [`);
    }

    let isFirstDoc = true;
    for await (const doc of cursor) {
      let data = doc.toObject ? doc.toObject() : doc;
      if (stripFn) {
        data = stripFn(data);
      }
      const jsonStr = JSON.stringify(data);
      
      if (!isFirstDoc) {
        this.write(",\n" + jsonStr);
      } else {
        this.write("\n" + jsonStr);
        isFirstDoc = false;
      }
    }
    this.write("\n]");
  }
}

export async function generateBackup(jobId: string) {
  const job = await BackupJob.findById(jobId);
  if (!job) return;

  try {
    job.status = "running";
    job.startedAt = new Date();
    await job.save();

    const config = await BackupConfig.findOne({ restaurantId: job.restaurantId });
    if (!config) {
      throw new Error("Backup config not found");
    }

    const storageKey = `backup_${job.restaurantId}_${Date.now()}.json.gz`;
    const passThrough = new PassThrough();
    const gzip = zlib.createGzip();
    
    // Size tracking
    let compressedSize = 0;
    gzip.on("data", (chunk) => {
      compressedSize += chunk.length;
    });

    const storage = getBackupStorage();
    const uploadPromise = storage.uploadStream(storageKey, gzip);

    // Instead of passing gzip directly, we pipe passThrough -> gzip
    passThrough.pipe(gzip);

    const hash = crypto.createHash("sha256");
    const writer = new JSONStreamWriter(passThrough, hash);

    writer.write(`{\n"_metadata": `);
    
    // Generate counts (rough estimates using countDocuments to avoid O(N) loading)
    const counts: Record<string, number> = {
      restaurants: await Restaurant.countDocuments({ _id: job.restaurantId }),
      categories: await Category.countDocuments({ restaurantId: job.restaurantId }),
      menuItems: await MenuItem.countDocuments({ restaurantId: job.restaurantId }),
      ownerSettings: await OwnerSetting.countDocuments({ restaurantId: job.restaurantId }),
      staff: await User.countDocuments({ "roleRequests.restaurantId": job.restaurantId }),
    };

    if (config.includeOrders) counts.orders = await Order.countDocuments({ restaurantId: job.restaurantId });
    if (config.includeReviews) counts.reviews = await Review.countDocuments({ restaurantId: job.restaurantId });
    if (config.includeAnalytics) counts.notifications = await Notification.countDocuments({ restaurantId: job.restaurantId }); // Map notifications to analytics flag as requested

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    const metadata = {
      schemaVersion: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      restaurantId: job.restaurantId,
      counts,
    };

    writer.write(JSON.stringify(metadata));
    writer.write(`,\n"collections": {`);

    // Stream Collections
    await writer.writeCursor(
      Restaurant.find({ _id: job.restaurantId }).cursor(),
      "restaurants",
      true
    );

    await writer.writeCursor(
      Category.find({ restaurantId: job.restaurantId }).cursor(),
      "categories",
      false
    );

    await writer.writeCursor(
      MenuItem.find({ restaurantId: job.restaurantId }).cursor(),
      "menuItems",
      false
    );

    await writer.writeCursor(
      OwnerSetting.find({ restaurantId: job.restaurantId }).cursor(),
      "ownerSettings",
      false
    );

    // Staff extraction (Stripping secrets)
    await writer.writeCursor(
      User.find({ "roleRequests.restaurantId": job.restaurantId }).cursor(),
      "staff",
      false,
      (doc) => {
        delete doc.password;
        delete doc.refreshToken;
        return doc;
      }
    );

    if (config.includeOrders) {
      await writer.writeCursor(
        Order.find({ restaurantId: job.restaurantId }).cursor(),
        "orders",
        false
      );
    }

    if (config.includeReviews) {
      await writer.writeCursor(
        Review.find({ restaurantId: job.restaurantId }).cursor(),
        "reviews",
        false
      );
    }

    if (config.includeAnalytics) {
      await writer.writeCursor(
        Notification.find({ restaurantId: job.restaurantId }).cursor(),
        "notifications",
        false
      );
    }

    writer.write(`\n}\n}`);
    passThrough.end();

    await uploadPromise;

    const finalChecksum = hash.digest("hex");

    const snapshot = new BackupSnapshot({
      backupJobId: job._id,
      restaurantId: job.restaurantId,
      storageKey,
      checksum: finalChecksum,
      compressedSize,
      schemaVersion: SCHEMA_VERSION,
    });
    await snapshot.save();

    job.status = "completed";
    job.completedAt = new Date();
    job.recordCount = totalRecords;
    job.size = compressedSize; // Approx size
    job.checksum = finalChecksum;
    
    // Set retention expiry
    if (config.retentionDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + config.retentionDays);
      job.expiresAt = expiry;
    }

    await job.save();
    
  } catch (error: any) {
    console.error("Backup Engine Error:", error);
    job.status = "failed";
    job.failureReason = error.message;
    await job.save();
  }
}
