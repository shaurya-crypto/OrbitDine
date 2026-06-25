import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import dbConnect from "@/lib/mongodb/db";
import BackupJob from "@/models/BackupJob";
import BackupSnapshot from "@/models/BackupSnapshot";
import { getBackupStorage } from "@/lib/backups/storage";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.roles.includes("owner")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await context.params;

    const job = await BackupJob.findOne({ _id: id, restaurantId: payload.restaurantId });
    if (!job) {
      return NextResponse.json({ error: "Backup not found or unauthorized" }, { status: 404 });
    }

    // Attempt to delete snapshot if it exists
    const snapshot = await BackupSnapshot.findOne({ backupJobId: job._id });
    if (snapshot) {
      try {
        const storage = getBackupStorage();
        await storage.deleteObject(snapshot.storageKey);
      } catch (err) {
        console.error("Failed to delete from storage", err);
      }
      await BackupSnapshot.deleteOne({ _id: snapshot._id });
    }

    await BackupJob.deleteOne({ _id: job._id });

    return NextResponse.json({ message: "Backup deleted" });
  } catch (error: any) {
    console.error("Owner Backup Delete Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
