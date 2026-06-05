import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import TableModel from "@/models/Table";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { restaurantId, updates } = body;

    if (!restaurantId || !Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: "Invalid request format" }, { status: 400 });
    }

    const bulkOps = updates.map((update: { id: string, x: number, y: number }) => ({
      updateOne: {
        filter: { _id: update.id, restaurantId },
        update: { $set: { x: update.x, y: update.y } }
      }
    }));

    if (bulkOps.length > 0) {
      await TableModel.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Positions updated" }, { status: 200 });
  } catch (error: any) {
    console.error("Save Positions Error:", error);
    return NextResponse.json({ success: false, message: "Failed to save positions", error: error.message }, { status: 500 });
  }
}
