import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import dbConnect from "@/lib/mongodb/db";
import BackupJob from "@/models/BackupJob";
import BackupSnapshot from "@/models/BackupSnapshot";
import AuditLog from "@/models/AuditLog";
import { getBackupStorage } from "@/lib/backups/storage";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await context.params;

    const job = await BackupJob.findById(id);
    if (!job) return NextResponse.json({ error: "Backup not found" }, { status: 404 });

    // Authorization
    if (!payload.roles.includes("admin")) {
      if (job.restaurantId.toString() !== payload.restaurantId?.toString()) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (job.status !== "completed") {
      return NextResponse.json({ error: "Backup is not completed" }, { status: 400 });
    }

    const snapshot = await BackupSnapshot.findOne({ backupJobId: job._id });
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot missing" }, { status: 404 });
    }

    await AuditLog.create({
      actorId: payload.userId,
      actorRole: payload.roles.includes("admin") ? "admin" : "owner",
      action: "BACKUP_DOWNLOADED",
      restaurantId: job.restaurantId,
      afterState: { backupId: job.backupId, snapshotId: snapshot._id },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
    });

    const storage = getBackupStorage();
    const stream = await storage.downloadStream(snapshot.storageKey);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${snapshot.storageKey}"`,
      },
    });
  } catch (error: any) {
    console.error("Backup Download Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
