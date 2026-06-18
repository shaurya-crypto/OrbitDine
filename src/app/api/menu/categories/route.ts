import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { restaurantId, name, sortOrder, image } = body;

    if (!restaurantId || !name) {
      return NextResponse.json({ error: "restaurantId and name are required" }, { status: 400 });
    }

    const category = new Category({
      restaurantId,
      name,
      sortOrder: sortOrder || 0,
      image,
    });
    await category.save();

    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { menuVersion: 1 } });

    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { categoryId, name, sortOrder, image } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (name) category.name = name;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (image !== undefined) category.image = image;

    await category.save();

    await Restaurant.findByIdAndUpdate(category.restaurantId, { $inc: { menuVersion: 1 } });

    return NextResponse.json({ message: "Category updated", category });
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    // Check if category contains any non-deleted menu items
    const itemsCount = await MenuItem.countDocuments({ categoryId, isDeleted: false });
    if (itemsCount > 0) {
      return NextResponse.json({ error: "Cannot delete category containing active menu items" }, { status: 400 });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (category) {
      await Restaurant.findByIdAndUpdate(category.restaurantId, { $inc: { menuVersion: 1 } });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
