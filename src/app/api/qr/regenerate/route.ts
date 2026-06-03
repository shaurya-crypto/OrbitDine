import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import qrcodeLib from "qrcode";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { tableId } = body;

    if (!tableId) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Invalidate existing QR codes for this table
    await QRCode.updateMany({ tableId }, { $set: { active: false } });

    // Generate a fresh one
    const code = crypto.randomBytes(4).toString("hex");
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/scan/${code}`;
    const qrImage = await qrcodeLib.toDataURL(url);

    const activeQr = new QRCode({
      restaurantId: table.restaurantId,
      tableId: table._id,
      code,
      qrImage,
      active: true,
      type: "table",
    });
    await activeQr.save();

    table.qrCodeId = activeQr._id;
    await table.save();

    return NextResponse.json({ message: "QR Code regenerated successfully", qrCode: activeQr });
  } catch (error: any) {
    console.error("Regenerate QR Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
