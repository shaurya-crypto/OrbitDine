import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import Restaurant from "@/models/Restaurant";
import qrcodeLib from "qrcode";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { restaurantId, tableNumber, capacity, section, notes } = body;

    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: "restaurantId and tableNumber are required" }, { status: 400 });
    }

    const tableExists = await Table.findOne({ restaurantId, tableNumber });
    if (tableExists) {
      return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
    }

    const table = new Table({
      restaurantId,
      tableNumber,
      capacity,
      section,
      notes,
      isActive: true,
      status: "available",
    });
    await table.save();

    const code = crypto.randomBytes(4).toString("hex");
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
    
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalTables: 1 } });

    return NextResponse.json({ message: "Table created", table }, { status: 201 });
  } catch (error: any) {
    console.error("Create Table Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json();
    const { tableId, tableNumber, capacity, section, notes, isActive } = body;

    if (!tableId) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (tableNumber && tableNumber !== table.tableNumber) {
      const exists = await Table.findOne({ restaurantId: table.restaurantId, tableNumber });
      if (exists) {
        return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
      }
      table.tableNumber = tableNumber;
    }

    if (capacity !== undefined) table.capacity = capacity;
    if (section !== undefined) table.section = section;
    if (notes !== undefined) table.notes = notes;
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();

    return NextResponse.json({ message: "Table updated", table });
  } catch (error: any) {
    console.error("Update Table Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const tableId = req.nextUrl.searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (table.activeSessionId || table.status !== "available") {
      return NextResponse.json({ error: "Cannot delete a table with an active session" }, { status: 400 });
    }

    await QRCode.deleteMany({ tableId });
    await Table.findByIdAndDelete(tableId);
    await Restaurant.findByIdAndUpdate(table.restaurantId, { $inc: { totalTables: -1 } });

    return NextResponse.json({ message: "Table deleted" });
  } catch (error: any) {
    console.error("Delete Table Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
