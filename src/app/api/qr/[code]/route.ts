import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import QRCodeModel from "@/models/QRCode";

export async function GET(req: Request, context: any) {
  try {
    await dbConnect();
    
    // We must await context.params to get the dynamic route segment securely in Next.js 15
    const { code } = await context.params;

    if (!code) {
      return NextResponse.json({ success: false, message: "QR code is required" }, { status: 400 });
    }

    const qrRecord = await QRCodeModel.findOne({ code, active: true })
      .populate("restaurantId", "name slug settings")
      .populate("tableId", "tableNumber status capacity activeSessionId");

    if (!qrRecord) {
      return NextResponse.json({ success: false, message: "Invalid or inactive QR code" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const scanUrl = `${baseUrl}/scan/${qrRecord.code}`;

    return NextResponse.json({
      success: true,
      data: {
        code: qrRecord.code,
        scanUrl,
        restaurant: qrRecord.restaurantId,
        table: qrRecord.tableId,
        type: qrRecord.type,
      },
    });
  } catch (error: any) {
    console.error("Get QR Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve QR code", error: error.message },
      { status: 500 }
    );
  }
}
