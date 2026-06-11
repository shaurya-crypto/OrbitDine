import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import CategoryModel from "@/models/Category";
import MenuItemModel from "@/models/MenuItem";
import { verifyAccessToken } from "@/lib/auth/jwt";

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

export async function DELETE(req: Request, context: any) {
  try {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("accessToken="))?.split("=")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { restaurantId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID format" }, { status: 400 });
    }

    // Ensure the user owns this restaurant
    if (payload.restaurantId !== restaurantId && !payload.roles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden. Not your restaurant." }, { status: 403 });
    }

    await Promise.all([
      CategoryModel.deleteMany({ restaurantId }),
      MenuItemModel.deleteMany({ restaurantId }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Menu cleared successfully"
    });
  } catch (error: any) {
    console.error("Clear Menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear menu", error: error.message },
      { status: 500 }
    );
  }
}
