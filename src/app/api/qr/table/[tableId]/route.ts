import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import qrcodeLib from "qrcode";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tableId: string }> }
) {
  try {
    await dbConnect();
    const { tableId } = await context.params;

    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    let activeQr = await QRCode.findOne({ tableId, active: true });

    if (!activeQr) {
      // Dynamically generate one on the fly
      const code = crypto.randomBytes(4).toString("hex");
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/scan/${code}`;
      const qrImage = await qrcodeLib.toDataURL(url);

      activeQr = new QRCode({
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
    }

    return NextResponse.json({ qrCode: activeQr });
  } catch (error: any) {
    console.error("GET Table QR Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
