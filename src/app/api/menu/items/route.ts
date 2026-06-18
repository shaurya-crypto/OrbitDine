import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import { eventBus } from "@/lib/services/eventBus";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      restaurantId, categoryId, name, description, price, image, veg, available, 
      addons, tags, isBestseller, isRecommended, chefSpecial, isNewArrival, limitedTimeOffer, sortOrder,
      ingredients, allergens, dietaryTags, nutritionInfo
    } = body;

    if (!restaurantId || !categoryId || !name || price === undefined) {
      return NextResponse.json({ error: "restaurantId, categoryId, name, and price are required" }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const menuItem = new MenuItem({
      restaurantId,
      categoryId,
      name,
      description,
      price,
      image,
      veg,
      available,
      addons,
      tags,
      isBestseller,
      isRecommended,
      chefSpecial,
      isNewArrival,
      limitedTimeOffer,
      ingredients,
      allergens,
      dietaryTags,
      nutritionInfo,
      sortOrder: sortOrder || 0,
      isDeleted: false,
    });
    await menuItem.save();
    
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { menuVersion: 1 } });

    return NextResponse.json({ message: "Menu item created", menuItem }, { status: 201 });
  } catch (error: any) {
    console.error("Create MenuItem Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { itemId, ...updates } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Apply updates
    Object.assign(menuItem, updates);

    await menuItem.save();
    
    await Restaurant.findByIdAndUpdate(menuItem.restaurantId, { $inc: { menuVersion: 1 } });

    eventBus.emitMenuItemUpdated({
      menuItemId: menuItem._id.toString(),
      restaurantId: menuItem.restaurantId.toString(),
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Menu item updated", menuItem });
  } catch (error: any) {
    console.error("Update MenuItem Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Soft delete
    menuItem.isDeleted = true;
    await menuItem.save();
    
    await Restaurant.findByIdAndUpdate(menuItem.restaurantId, { $inc: { menuVersion: 1 } });

    eventBus.emitMenuItemUpdated({
      menuItemId: menuItem._id.toString(),
      restaurantId: menuItem.restaurantId.toString(),
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error: any) {
    console.error("Delete MenuItem Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
