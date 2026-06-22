import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import OrderSession from "@/models/OrderSession";
import Restaurant from "@/models/Restaurant";
import Review from "@/models/Review";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import Bill from "@/models/Bill";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { processSecurityPipeline } from "@/lib/security/pipeline";

export async function GET(req: NextRequest) {
  try {
    const pipeline = await processSecurityPipeline(req, {
      requireCsrf: false, // Not needed for GET
      rateLimit: { key: "customer_dashboard", limit: 60, windowMs: 60000 },
    });
    if (!pipeline.success) return pipeline.response;

    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Prevent tree-shaking of imported schemas
    if (!MenuItem) console.warn("MenuItem not loaded");
    if (!Restaurant) console.warn("Restaurant not loaded");
    if (!Review) console.warn("Review not loaded");
    if (!Order) console.warn("Order not loaded");
    if (!Bill) console.warn("Bill not loaded");

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10")));
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const skip = (page - 1) * limit;

    const user = await User.findById(decoded.userId)
      .populate("savedRestaurants", "name bannerImage cuisine type")
      .populate("favoriteItems", "name price image");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch order history (sessions linked to this user)
    const sessions = await OrderSession.find({ userId: user._id })
      .populate("restaurantId", "name bannerImage")
      .populate("orderIds")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch corresponding bills
    const sessionIds = sessions.map(s => s._id);
    const bills = await Bill.find({ sessionId: { $in: sessionIds } }).lean();
    const billMap = new Map(bills.map((b: any) => [b.sessionId.toString(), b]));

    // Fetch reviews submitted by this user
    const reviews = await Review.find({ customerId: user._id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
        recentOrders: sessions.map((s: any) => {
          const bill: any = billMap.get(s._id.toString());
          const orders = s.orderIds || [];
          
          let itemsCount = 0;
          let total = 0;
          
          if (bill) {
             itemsCount = bill.itemsSnapshot?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
             total = bill.grandTotal || 0;
          } else {
             // Fallback to active orders if bill not generated yet
             orders.forEach((order: any) => {
               if (order.status !== 'cancelled') {
                 itemsCount += order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                 total += order.grandTotal || 0;
               }
             });
             // Also include cart if they haven't ordered everything
             itemsCount += s.cart?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
             total += s.cart?.reduce((acc: number, item: any) => acc + item.itemTotal, 0) || 0;
          }
          
          return {
            sessionId: s._id,
            restaurant: s.restaurantId ? { id: s.restaurantId._id, name: s.restaurantId.name, image: s.restaurantId.bannerImage } : null,
            date: s.createdAt,
            itemsCount,
            total,
            status: s.status,
          };
        }),
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
