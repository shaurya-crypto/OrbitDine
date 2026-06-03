import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import qrcodeLib from "qrcode";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { restaurantId, address, city, cuisineType, totalTables } = body;

    if (!restaurantId || !address || !city || !cuisineType || typeof totalTables !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    restaurant.address = address;
    restaurant.city = city;
    restaurant.cuisineType = cuisineType;
    restaurant.totalTables = totalTables;
    restaurant.status = "active";
    await restaurant.save();

    // Clear existing tables and QR codes for clean onboarding
    await Table.deleteMany({ restaurantId });
    await QRCode.deleteMany({ restaurantId });

    // Generate Tables and QRCodes
    for (let i = 1; i <= totalTables; i++) {
      const table = new Table({
        restaurantId,
        tableNumber: i.toString(),
        isActive: true,
        status: "available",
      });
      await table.save();

      const code = crypto.randomBytes(4).toString("hex"); // 8-char hex
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/scan/${code}`;
      const qrImage = await qrcodeLib.toDataURL(url);

      const qr = new QRCode({
        restaurantId,
        tableId: table._id,
        code,
        qrImage,
        active: true,
        type: "table",
      });
      await qr.save();

      table.qrCodeId = qr._id;
      await table.save();
    }

    return NextResponse.json({ message: "Onboarding complete", restaurant });
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
