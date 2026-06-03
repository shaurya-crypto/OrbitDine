import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";

export async function GET(req: Request, context: any) {
  try {
    await dbConnect();
    
    // In Next.js 15, route parameters must be awaited
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid session ID format" }, { status: 400 });
    }

    const orderSession = await OrderSessionModel.findById(id)
      .populate("restaurantId", "name slug settings")
      .populate("tableId", "tableNumber status");

    if (!orderSession) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: orderSession,
    });
  } catch (error: any) {
    console.error("Get Session Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve session", error: error.message },
      { status: 500 }
    );
  }
}
