import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import OrderSession from "@/models/OrderSession";
import Restaurant from "@/models/Restaurant";
import Review from "@/models/Review";
import MenuItem from "@/models/MenuItem";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("; ").find(r => r.startsWith("accessToken="))?.split("=")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Prevent tree-shaking of imported schemas
    if (!MenuItem) console.warn("MenuItem not loaded");
    if (!Restaurant) console.warn("Restaurant not loaded");
    if (!Review) console.warn("Review not loaded");

    const user = await User.findById(decoded.userId)
      .populate("savedRestaurants", "name bannerImage cuisine type")
      .populate("favoriteItems", "name price image");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch order history (sessions linked to this user)
    const sessions = await OrderSession.find({ userId: user._id })
      .populate("restaurantId", "name bannerImage")
      .sort({ createdAt: -1 })
      .limit(10); // Fetch top 10 recent

    // Fetch reviews submitted by this user
    const reviews = await Review.find({ customerId: user._id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate dynamic analytics from sessions if not set correctly
    const restaurantsVisited = new Set(sessions.map(s => s.restaurantId?._id?.toString())).size;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          totalSpent: user.totalSpent || 0,
          totalOrders: user.totalOrders || 0,
          achievements: user.achievements || [],
          restaurantsVisited,
          locationEnabled: user.locationEnabled || false,
          defaultCity: user.defaultCity || "",
        },
        recentOrders: sessions.map((s: any) => ({
          sessionId: s._id,
          restaurant: s.restaurantId ? { id: s.restaurantId._id, name: s.restaurantId.name, image: s.restaurantId.bannerImage } : null,
          date: s.createdAt,
          itemsCount: s.cart.reduce((acc: number, item: any) => acc + item.quantity, 0),
          total: s.cart.reduce((acc: number, item: any) => acc + item.itemTotal, 0),
          status: s.status,
        })),
        savedRestaurants: user.savedRestaurants || [],
        favoriteItems: user.favoriteItems || [],
        recentReviews: reviews,
      }
    });

  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
