import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import dbConnect from "@/lib/mongodb/db";
import RestoreJob from "@/models/RestoreJob";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.roles.includes("superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    // Admins can see all restore operations
    const jobs = await RestoreJob.find()
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = await RestoreJob.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let activeCount = 0;
    let completedCount = 0;
    
    stats.forEach(stat => {
      if (stat._id === "running" || stat._id === "pending") activeCount += stat.count;
      if (stat._id === "completed") completedCount += stat.count;
    });

    return NextResponse.json({ jobs, activeCount, completedCount });
  } catch (error: any) {
    console.error("Admin Restore History Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
