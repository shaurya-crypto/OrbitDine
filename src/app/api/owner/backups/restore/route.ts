import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb/db";
import BackupSnapshot from "@/models/BackupSnapshot";
import RestoreJob from "@/models/RestoreJob";
import { executeRestore } from "@/lib/backups/restoreEngine";
import { createAuditLog } from "@/lib/audit/createAuditLog";
import mongoose from "mongoose";
import crypto from "crypto";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new TextEncoder().encode("fallback_secret");
  return new TextEncoder().encode(secret);
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.roles || !(payload.roles as string[]).includes("owner")) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const restaurantId = payload.restaurantId as string;
    if (!restaurantId) return new NextResponse(JSON.stringify({ error: "Missing restaurantId" }), { status: 400 });

    const { snapshotId: backupJobId } = await req.json();
    if (!backupJobId) return new NextResponse(JSON.stringify({ error: "Missing backup ID" }), { status: 400 });

    await connectToDatabase();

    const snapshot = await BackupSnapshot.findOne({ backupJobId, restaurantId });
    if (!snapshot) {
      return new NextResponse(JSON.stringify({ error: "Snapshot not found or unauthorized" }), { status: 404 });
    }

    // Check if there is already a running restore job
    const runningJob = await RestoreJob.findOne({ restaurantId, status: { $in: ["pending", "running"] } });
    if (runningJob) {
      return new NextResponse(JSON.stringify({ error: "A restore or backup operation is already running" }), { status: 409 });
    }

    const restoreJobId = `RESTORE_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    
    const newJob = new RestoreJob({
      jobId: restoreJobId,
      snapshotId: snapshot._id.toString(),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: "owner",
      status: "pending",
    });
    
    await newJob.save();

    await createAuditLog({
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: "owner",
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      action: "RESTORE_STARTED",
      targetType: "System",
      reason: `Owner initiated restore for snapshot ${snapshot._id}`,
    });

    // Execute in background
    executeRestore(newJob._id.toString()).catch(console.error);

    return NextResponse.json({ message: "Restore initiated", jobId: newJob._id });
  } catch (error: any) {
    console.error("Owner Restore API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
