import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderModel from "@/models/Order";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ success: false, message: "Invalid or missing sessionId" }, { status: 400 });
    }

    // Customer tracking their orders
    const activeOrders = await OrderModel.find({
      sessionId,
      status: { $ne: "cancelled" }, // usually show all non-cancelled, maybe even cancelled with a label
    })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({
      success: true,
      data: activeOrders,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get Tracking Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve order tracking", error: error.message }, { status: 500 });
  }
}
