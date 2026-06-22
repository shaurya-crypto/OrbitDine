import { NextRequest, NextResponse } from "next/server";
import { eventBus } from "@/lib/services/eventBus";
import connectToDatabase from "@/lib/mongodb/db";
import Table from "@/models/Table";

export async function POST(req: NextRequest) {
  try {
    const { tableId, restaurantId } = await req.json();

    if (!tableId || !restaurantId) {
      return NextResponse.json({ message: "tableId and restaurantId are required" }, { status: 400 });
    }

    await connectToDatabase();
    const table = await Table.findById(tableId);

    await eventBus.emitEmergency({
      tableId,
      restaurantId,
      tableName: table ? `Table ${table.tableNumber}` : tableId,
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Emergency alert sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Emergency Alert Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
