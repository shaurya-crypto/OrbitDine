import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import RestaurantModel from "@/models/Restaurant";
import { calculateCartTotals } from "@/lib/services/cartService";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // In GET requests without dynamic routes, we extract params from URL searchParams
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ success: false, message: "Invalid or missing sessionId" }, { status: 400 });
    }

    const session = await OrderSessionModel.findById(sessionId);
    if (!session || session.status !== "active") {
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    const restaurant = await RestaurantModel.findById(session.restaurantId).lean();
    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
    }

    const totals = calculateCartTotals(session, restaurant);

    return NextResponse.json({
      success: true,
      data: totals,
    });

  } catch (error: any) {
    console.error("Get Cart Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve cart", error: error.message },
      { status: 500 }
    );
  }
}
