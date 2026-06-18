import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // Determine intent from query
    const isVegQuery = query.toLowerCase().includes("veg") && !query.toLowerCase().includes("non-veg");
    const isNonVegQuery = query.toLowerCase().includes("non");
    const isOfferQuery = query.toLowerCase().includes("offer") || query.toLowerCase().includes("discount");

    // Perform Text Searches
    const [restaurants, items] = await Promise.all([
      Restaurant.find(
        { $text: { $search: query }, status: "active" },
        { score: { $meta: "textScore" } }
      )
      .select("name slug logo bannerImage cuisineType rating reviewCount averagePrice city address")
      .sort({ score: { $meta: "textScore" }, followerCount: -1, rating: -1 })
      .limit(10)
      .lean(),
      
      MenuItem.find(
        { 
          $text: { $search: query }, 
          isDeleted: false,
          available: true,
          ...(isVegQuery ? { veg: true } : {}),
          ...(isNonVegQuery ? { veg: false } : {}),
          ...(isOfferQuery ? { limitedTimeOffer: true } : {})
        },
        { score: { $meta: "textScore" } }
      )
      .populate("restaurantId", "name slug")
      .select("name description price image veg tags isBestseller")
      .sort({ score: { $meta: "textScore" }, sortOrder: 1 })
      .limit(15)
      .lean()
    ]);

    // Fallback regex search for typo tolerance if text search yields no results
    let fallbackRestaurants = restaurants;
    let fallbackItems = items;

    if (restaurants.length === 0 && items.length === 0) {
      const regex = new RegExp(query.split("").join(".*"), "i"); // Simple fuzzy matching
      
      fallbackRestaurants = await Restaurant.find({
        $or: [{ name: regex }, { cuisineType: regex }],
        status: "active"
      })
      .select("name slug logo cuisineType rating reviewCount")
      .limit(5)
      .lean();

      fallbackItems = await MenuItem.find({
        $or: [{ name: regex }, { tags: regex }],
        isDeleted: false
      })
      .populate("restaurantId", "name slug")
      .select("name description price image veg isBestseller")
      .limit(10)
      .lean();
    }

    return NextResponse.json({
      success: true,
      query,
      results: {
        restaurants: fallbackRestaurants,
        items: fallbackItems,
      }
    });

  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
