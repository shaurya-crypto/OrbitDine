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
    if (!payload.roles || !(payload.roles as string[]).includes("superadmin")) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { snapshotId } = await req.json();
    if (!snapshotId) return new NextResponse(JSON.stringify({ error: "Missing snapshotId" }), { status: 400 });

    await connectToDatabase();

    const snapshot = await BackupSnapshot.findById(snapshotId);
    if (!snapshot) {
      return new NextResponse(JSON.stringify({ error: "Snapshot not found" }), { status: 404 });
    }

    const restaurantId = snapshot.restaurantId;

    // Check if there is already a running restore job for this restaurant
    const runningJob = await RestoreJob.findOne({ restaurantId, status: { $in: ["pending", "running"] } });
    if (runningJob) {
      return new NextResponse(JSON.stringify({ error: "A restore operation is already running for this restaurant" }), { status: 409 });
    }

    const restoreJobId = `RESTORE_ADMIN_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    
    const newJob = new RestoreJob({
      jobId: restoreJobId,
      snapshotId: snapshot._id.toString(),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: "superadmin",
      status: "pending",
    });
    
    await newJob.save();

    await createAuditLog({
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: "admin",
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      action: "RESTORE_STARTED",
      targetType: "System",
      reason: `Admin forced restore for snapshot ${snapshot._id}`,
    });

    // Execute in background
    executeRestore(newJob._id.toString()).catch(console.error);

    return NextResponse.json({ message: "Admin Restore initiated", jobId: newJob._id });
  } catch (error: any) {
    console.error("Admin Restore API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
