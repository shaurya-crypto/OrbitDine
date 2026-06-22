import mongoose from "mongoose";
import crypto from "crypto";
import zlib from "zlib";
import { getBackupStorage } from "./storage";
import BackupSnapshot from "@/models/BackupSnapshot";
import BackupJob from "@/models/BackupJob";
import RestoreJob from "@/models/RestoreJob";
import { generateBackup } from "./engine";
import { createAuditLog } from "@/lib/audit/createAuditLog";

import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Review from "@/models/Review";
import User from "@/models/User";
import OwnerSetting from "@/models/OwnerSetting";
import Notification from "@/models/Notification";

const SCHEMA_VERSION = "1.0.0";

// Using the imported models
const modelMap: Record<string, mongoose.Model<any>> = {
  restaurants: Restaurant,
  categories: Category,
  menuItems: MenuItem,
  ownerSettings: OwnerSetting,
  staff: User,
  orders: Order,
  reviews: Review,
  notifications: Notification,
};

export async function executeRestore(restoreJobId: string) {
  const job = await RestoreJob.findById(restoreJobId);
  if (!job) return;

  try {
    job.status = "running";
    job.startedAt = new Date();
    await job.save();

    const snapshot = await BackupSnapshot.findById(job.snapshotId);
    if (!snapshot) throw new Error("Target BackupSnapshot not found");

    // 1. Automatic Pre-Restore Backup
    const preRestoreJob = new BackupJob({
      backupId: `EMERGENCY_PRE_RESTORE_${Date.now()}`,
      restaurantId: job.restaurantId,
      status: "pending",
      size: 0,
    });
    await preRestoreJob.save();
    
    await generateBackup(preRestoreJob._id.toString());
    
    const preRestoreJobCheck = await BackupJob.findById(preRestoreJob._id);
    if (preRestoreJobCheck?.status !== "completed") {
      throw new Error(`Pre-restore backup failed: ${preRestoreJobCheck?.failureReason}`);
    }

    const preRestoreSnapshot = await BackupSnapshot.findOne({ backupJobId: preRestoreJob._id });
    if (preRestoreSnapshot) {
      job.preRestoreSnapshotId = preRestoreSnapshot._id as mongoose.Types.ObjectId;
      await job.save();
    }

    // 2. Download and Decompress
    const storage = getBackupStorage();
    const compressedStream = await storage.downloadStream(snapshot.storageKey);
    const gunzip = zlib.createGunzip();
    
    // 3. Checksum Verification
    // We pipe the compressed stream through gunzip, but wait, the checksum in BackupSnapshot 
    // was computed on the UNCOMPRESSED JSON string in engine.ts (writer.write -> hash.update)
    const hash = crypto.createHash("sha256");
    
    const uncompressedStream = compressedStream.pipe(gunzip);
    
    const chunks: Buffer[] = [];
    for await (const chunk of uncompressedStream) {
      hash.update(chunk);
      chunks.push(chunk);
    }
    const uncompressedBuffer = Buffer.concat(chunks);
    const computedChecksum = hash.digest("hex");

    if (computedChecksum !== snapshot.checksum) {
      throw new Error(`Checksum mismatch. Expected: ${snapshot.checksum}, Computed: ${computedChecksum}. Archive is corrupted.`);
    }

    // 4. Parse JSON
    let backupData: Record<string, unknown>;
    try {
      backupData = JSON.parse(uncompressedBuffer.toString("utf-8"));
    } catch {
      throw new Error("Invalid JSON in backup archive");
    }

    // 5. Validate Metadata
    interface BackupMetadata {
      schemaVersion?: string;
      restaurantId?: string;
    }
    const metadata = backupData._metadata as BackupMetadata;
    if (!metadata) throw new Error("Missing metadata in backup archive");
    if (metadata.schemaVersion !== SCHEMA_VERSION) throw new Error(`Unsupported schema version: ${metadata.schemaVersion}`);
    if (!metadata.restaurantId || metadata.restaurantId.toString() !== job.restaurantId.toString()) {
      throw new Error(`Restaurant ID mismatch in backup archive`);
    }

    // 6. Execute Transactional Restore
    const session = await mongoose.startSession();
    session.startTransaction();

    let processed = 0;
    let updated = 0;
    let created = 0;

    try {
      const collections = (backupData.collections as Record<string, Record<string, any>[]>) || {};
      for (const [collectionName, records] of Object.entries(collections)) {
        const Model = modelMap[collectionName];
        if (!Model) continue;

        if (Array.isArray(records) && records.length > 0) {
          const bulkOps = records.map((doc) => {
            const { _id, ...updateData } = doc;
            return {
              updateOne: {
                filter: { _id },
                update: { $set: updateData },
                upsert: true
              }
            };
          });

          const result = await Model.bulkWrite(bulkOps, { session });
          
          processed += records.length;
          updated += result.modifiedCount || 0;
          created += result.upsertedCount || 0;
        }
      }

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Transaction aborted during restore: ${(error as Error).message}`);
    }

    // 7. Success Completion
    job.status = "completed";
    job.completedAt = new Date();
    job.recordsProcessed = processed;
    job.recordsUpdated = updated;
    job.recordsCreated = created;
    await job.save();

    await createAuditLog({
      actorId: job.actorId,
      actorRole: job.actorRole === "superadmin" ? "admin" : (job.actorRole as "owner" | "admin" | "system"),
      restaurantId: job.restaurantId,
      action: "RESTORE_COMPLETED",
      targetType: "System",
      reason: `Successfully restored snapshot ${snapshot._id}`,
      afterState: { processed, updated, created }
    });

  } catch (error) {
    const err = error as Error;
    console.error("Restore Engine Error:", err);
    job.status = "failed";
    job.failureReason = err.message;
    job.completedAt = new Date();
    await job.save();

    await createAuditLog({
      actorId: job.actorId,
      actorRole: job.actorRole === "superadmin" ? "admin" : (job.actorRole as "owner" | "admin" | "system"),
      restaurantId: job.restaurantId,
      action: "RESTORE_FAILED",
      targetType: "System",
      reason: `Failed to restore snapshot ${job.snapshotId}: ${err.message}`
    });
  }
}
