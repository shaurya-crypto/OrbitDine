import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import dbConnect from "@/lib/mongodb/db";
import BackupJob from "@/models/BackupJob";
import BackupConfig from "@/models/BackupConfig";
import AuditLog from "@/models/AuditLog";
import { generateBackup } from "@/lib/backups/engine";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.roles.includes("owner")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    // Fallback to explicit restaurantId in payload or request
    let restaurantId = payload.restaurantId;
    if (!restaurantId) {
       // Just in case it's missing from JWT but passed in body
       const body = await req.json().catch(() => ({}));
       if(body.restaurantId) {
         restaurantId = body.restaurantId;
       } else {
         return NextResponse.json({ error: "No restaurant attached to user" }, { status: 400 });
       }
    }

    // Check config
    let config = await BackupConfig.findOne({ restaurantId });
    if (!config) {
      // Create default
      config = await BackupConfig.create({ restaurantId, enabled: true });
    }

    // Check if one is already pending/running
    const existing = await BackupJob.findOne({ restaurantId, status: { $in: ["pending", "running"] } });
    if (existing) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (existing.createdAt < oneHourAgo) {
        // Mark the stuck job as failed
        existing.status = "failed";
        existing.failureReason = "Job timed out or server restarted";
        await existing.save();
      } else {
        return NextResponse.json({ error: "A backup is already in progress" }, { status: 429 });
      }
    }

    const backupId = `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const job = new BackupJob({
      backupId,
      actorId: payload.userId,
      actorRole: "owner",
      restaurantId,
      status: "pending",
      schemaVersion: "1.0.0",
    });

    await job.save();

    await AuditLog.create({
      actorId: payload.userId,
      actorRole: "owner",
      action: "BACKUP_INITIATED",
      restaurantId,
      afterState: { backupId },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Fire & Forget background execution
    generateBackup(job._id.toString()).catch(err => console.error("Async backup failed:", err));

    return NextResponse.json({ message: "Backup initiated", job }, { status: 201 });
  } catch (error: any) {
    console.error("Owner Backup Create Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
