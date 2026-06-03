import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID" }, { status: 400 });
    }

    // Active sessions are usually those that haven't been completed
    const activeSessions = await OrderSessionModel.find({
      restaurantId,
      status: { $in: ["active", "bill_requested"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: activeSessions }, { status: 200 });
  } catch (error: any) {
    console.error("Get Active Sessions Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve active sessions", error: error.message }, { status: 500 });
  }
}
