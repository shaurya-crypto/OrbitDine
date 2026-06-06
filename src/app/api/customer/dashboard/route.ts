import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import OrderSession from "@/models/OrderSession";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Auth check
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const userId = payload.userId;
    
    // Parse query params for search/sort
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "rating"; // rating, price, new
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    
    // 1. Fetch User Data (for saved restaurants)
    const user = await User.findById(userId).populate("savedRestaurants");
    
    // 2. Fetch Recent Orders
    const recentOrders = await OrderSession.find({ userId })
      .populate("restaurantId", "name logo")
      .sort({ createdAt: -1 })
      .limit(5);
      
    // 3. Fetch Restaurants (Marketplace)
    const query: any = { status: "active" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { cuisineType: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }
    
    let sortOption: any = { rating: -1 };
    if (sort === "price_asc") sortOption = { averagePrice: 1 };
    if (sort === "price_desc") sortOption = { averagePrice: -1 };
    if (sort === "new") sortOption = { createdAt: -1 };
    
    let exploreRestaurants = await Restaurant.find(query)
      .select("name slug logo cuisineType rating reviewCount averagePrice city address latitude longitude")
      .sort(sortOption)
      .limit(20)
      .lean();
      
    // If user provided location, we could theoretically do geospatial sorting here
    // but for MVP we will just return the sorted list.
    
    // Format response
    return NextResponse.json({
      user: {
        savedRestaurants: user?.savedRestaurants || []
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        restaurantName: (order.restaurantId as any)?.name || "Unknown Restaurant",
        restaurantId: (order.restaurantId as any)?._id,
        totalAmount: order.cart ? order.cart.reduce((sum: number, item: any) => sum + item.itemTotal, 0) : 0,
        date: order.createdAt,
        status: order.status
      })),
      exploreRestaurants
    });

  } catch (error) {
    console.error("Customer Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
