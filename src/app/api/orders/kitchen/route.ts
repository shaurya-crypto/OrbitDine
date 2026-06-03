import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderModel from "@/models/Order";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid or missing restaurantId" }, { status: 400 });
    }

    // Kitchen only cares about active orders (not served, not cancelled)
    const activeOrders = await OrderModel.find({
      restaurantId,
      status: { $in: ["received", "preparing", "ready"] },
    })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .lean();

    return NextResponse.json({
      success: true,
      data: activeOrders,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get Kitchen Orders Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve kitchen queue", error: error.message }, { status: 500 });
  }
}
