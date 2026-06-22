import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ error: "Valid restaurantId is required" }, { status: 400 });
    }

    await connectToDatabase();

    await Promise.all([
      MenuItem.deleteMany({ restaurantId }),
      Category.deleteMany({ restaurantId })
    ]);

    return NextResponse.json({ message: "Menu successfully cleared" }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to clear menu:", error);
    return NextResponse.json({ error: "Failed to clear menu" }, { status: 500 });
  }
}
