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
      .select("name logo bannerImage description cuisineType rating reviewCount keywords settings.currency address phone email openingHours closingHours location menuVersion");

    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant not found or inactive" }, { status: 404 });
    }

    // 2. Fetch Categories & MenuItems in parallel for performance
    const [categories, items] = await Promise.all([
      CategoryModel.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
      MenuItemModel.find({ restaurantId, available: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    const now = new Date();

    // 3. Group items by category and evaluate active Price Hikes
    const groupedMenu = categories.map((category) => {
      return {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        items: items
          .filter((item) => item.categoryId.toString() === category._id.toString())
          .map((item) => {
            // Evaluate Price Hike
            let currentPrice = item.price;
            if (item.priceHike?.active && item.priceHike.startTime && item.priceHike.endTime) {
              const start = new Date(item.priceHike.startTime);
              const end = new Date(item.priceHike.endTime);
              if (now >= start && now <= end && item.priceHike.newPrice) {
                currentPrice = item.priceHike.newPrice;
              }
            }

            return {
              id: item._id.toString(),
              name: item.name,
              description: item.description,
              price: currentPrice, // Overridden if hike is active
              originalPrice: currentPrice !== item.price ? item.price : undefined,
              image: item.image,
              veg: item.veg,
              tags: item.tags || [],
              addons: item.addons || [],
              isBestseller: item.isBestseller,
              isRecommended: item.isRecommended,
              chefSpecial: item.chefSpecial,
              mostOrdered: item.mostOrdered,
              isNewArrival: item.isNewArrival,
              limitedTimeOffer: item.limitedTimeOffer,
              ltoStartDate: item.ltoStartDate,
              ltoEndDate: item.ltoEndDate,
              flavorProfile: item.flavorProfile,
              spiceLevel: item.spiceLevel,
              seasonalityTags: item.seasonalityTags,
              aiTags: item.aiTags,
            };
          }),
      };
    });

    // 4. Return special categorized lists for the new UI
    const highlights = {
      bestsellers: items.filter((i) => i.isBestseller || i.mostOrdered).map(i => i._id.toString()),
      chefSpecials: items.filter((i) => i.chefSpecial).map(i => i._id.toString()),
      newArrivals: items.filter((i) => i.isNewArrival).map(i => i._id.toString()),
      limitedTimeOffers: items.filter((i) => 
        i.limitedTimeOffer && 
        (!i.ltoStartDate || new Date(i.ltoStartDate) <= now) && 
        (!i.ltoEndDate || new Date(i.ltoEndDate) >= now)
      ).map(i => i._id.toString()),
    };

    return NextResponse.json({
      success: true,
      data: {
        restaurant,
        menu: groupedMenu,
        highlights,
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
