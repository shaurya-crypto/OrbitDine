import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Table from "@/models/Table";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();
    const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });

    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { restaurantId, tableNumber, capacity, floor } = await req.json();

    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if tableNumber exists
    const existing = await Table.findOne({ restaurantId, tableNumber });
    if (existing) {
      return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
    }

    const newTable = await Table.create({
      restaurantId,
      tableNumber,
      capacity,
      floor: floor || "Main Floor"
    });

    return NextResponse.json({ message: "Table created", table: newTable }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) return NextResponse.json({ error: "Missing tableId" }, { status: 400 });

    await Table.findByIdAndDelete(tableId);

    return NextResponse.json({ message: "Table deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
