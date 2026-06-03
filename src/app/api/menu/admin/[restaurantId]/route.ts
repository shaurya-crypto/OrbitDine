import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import CategoryModel from "@/models/Category";
import MenuItemModel from "@/models/MenuItem";

export async function GET(req: Request, context: any) {
  try {
    await dbConnect();
    const { restaurantId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID format" }, { status: 400 });
    }

    const [categories, items] = await Promise.all([
      CategoryModel.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
      MenuItemModel.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      categories,
      items,
    });
  } catch (error: any) {
    console.error("Get Admin Menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve menu", error: error.message },
      { status: 500 }
    );
  }
}
