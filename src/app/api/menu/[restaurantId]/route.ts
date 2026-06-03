import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import RestaurantModel from "@/models/Restaurant";
import CategoryModel from "@/models/Category";
import MenuItemModel from "@/models/MenuItem";

export async function GET(req: Request, context: any) {
  try {
    await dbConnect();
    
    // In Next.js 15, route parameters must be awaited
    const { restaurantId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID format" }, { status: 400 });
    }

    // 1. Fetch Restaurant (ensure it exists)
    const restaurant = await RestaurantModel.findOne({ _id: restaurantId })
      .select("name logo description cuisineType settings.currency");

    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant not found or inactive" }, { status: 404 });
    }

    // 2. Fetch Categories & MenuItems in parallel for performance
    const [categories, items] = await Promise.all([
      CategoryModel.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
      MenuItemModel.find({ restaurantId, available: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    // 3. Group items by category
    const groupedMenu = categories.map((category) => {
      return {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        items: items
          .filter((item) => item.categoryId.toString() === category._id.toString())
          .map((item) => ({
            id: item._id.toString(),
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            veg: item.veg,
            tags: item.tags || [],
            addons: item.addons || [],
            isBestseller: item.isBestseller,
            isRecommended: item.isRecommended,
          })),
      };
    });

    // 4. Optionally return recommended/bestsellers as a separate quick-access list
    const bestsellers = items
      .filter((item) => item.isBestseller || item.isRecommended)
      .map((item) => ({
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        categoryId: item.categoryId.toString(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        restaurant,
        menu: groupedMenu,
        highlights: bestsellers,
      },
    });
  } catch (error: any) {
    console.error("Get Menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve menu", error: error.message },
      { status: 500 }
    );
  }
}
