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
    if (!payload || (!payload.roles.includes("admin") && !payload.roles.includes("superadmin"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    const body = await req.json().catch(() => ({}));
    const restaurantId = body.restaurantId;
    
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    let config = await BackupConfig.findOne({ restaurantId });
    if (!config) {
      config = await BackupConfig.create({ restaurantId, enabled: true });
    }

    const existing = await BackupJob.findOne({ restaurantId, status: { $in: ["pending", "running"] } });
    if (existing) {
      return NextResponse.json({ error: "A backup is already in progress for this restaurant" }, { status: 429 });
    }

    const backupId = `bkp_adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const job = new BackupJob({
      backupId,
      actorId: payload.userId,
      actorRole: "admin",
      restaurantId,
      status: "pending",
      schemaVersion: "1.0.0",
    });

    await job.save();

    await AuditLog.create({
      actorId: payload.userId,
      actorRole: "admin",
      action: "BACKUP_INITIATED_ADMIN",
      restaurantId,
      afterState: { backupId },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
    });

    generateBackup(job._id.toString()).catch(err => console.error("Async backup failed:", err));

    return NextResponse.json({ message: "Backup initiated", job }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Backup Create Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
