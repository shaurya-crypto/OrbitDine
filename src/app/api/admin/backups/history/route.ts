import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import dbConnect from "@/lib/mongodb/db";
import BackupJob from "@/models/BackupJob";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("admin") && !payload.roles.includes("superadmin"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { backupId: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } }
      ];
    }

    const jobs = await BackupJob.find(query)
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BackupJob.countDocuments(query);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Admin Backup History Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
