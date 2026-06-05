import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import QRCodeModel from "@/models/QRCode";
import TableModel from "@/models/Table";

export async function GET(req: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    await dbConnect();
    const { restaurantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID" }, { status: 400 });
    }

    const qrs = await QRCodeModel.find({ restaurantId }).populate("tableId", "tableNumber status activeSessionId").lean();

    return NextResponse.json({
      success: true,
      data: qrs,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Get QRs Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve QRs", error: error.message }, { status: 500 });
  }
}
