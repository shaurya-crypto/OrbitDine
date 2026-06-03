import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import TableModel from "@/models/Table";
import "@/models/QRCode"; // Ensure QRCode is registered for populate

export async function GET(req: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    await dbConnect();
    const { restaurantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID" }, { status: 400 });
    }

    const tables = await TableModel.find({ restaurantId })
      .populate("qrCodeId", "code qrImage")
      .sort({ tableNumber: 1 })
      .lean();

    return NextResponse.json({ success: true, data: tables }, { status: 200 });
  } catch (error: any) {
    console.error("Get Tables Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve tables", error: error.message }, { status: 500 });
  }
}
