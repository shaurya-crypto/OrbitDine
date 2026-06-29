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
import { CustomerRecommendationEngine } from "@/lib/bi/CustomerRecommendationEngine";

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
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const skip = (page - 1) * limit;

    const user = await User.findById(decoded.userId)
      .populate("savedRestaurants", "name bannerImage cuisine type")
      .populate("favoriteItems", "name price image");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ═══ ORDER HISTORY ═══
    const sessions = await OrderSession.find({ userId: user._id })
      .populate("restaurantId", "name bannerImage")
      .populate("orderIds")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const sessionIds = sessions.map(s => s._id);
    const bills = await Bill.find({ sessionId: { $in: sessionIds } }).lean();
    const billMap = new Map(bills.map((b: any) => [b.sessionId.toString(), b]));

    // ═══ REVIEWS ═══
    const reviews = await Review.find({ customerId: user._id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ═══ DYNAMIC ANALYTICS ═══
    const allSessions = await OrderSession.find({ userId: user._id, status: "completed" }).lean();
    const restaurantsVisited = new Set(allSessions.map((s: any) => s.restaurantId?.toString()).filter(Boolean)).size;

    // ═══ MONTHLY SPENDING (for chart) ═══
    const allSessionIds = allSessions.map(s => s._id);
    const allBills = await Bill.find({ sessionId: { $in: allSessionIds } }).lean();
    
    const monthlySpending: Record<string, number> = {};
    allBills.forEach((b: any) => {
      const month = new Date(b.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlySpending[month] = (monthlySpending[month] || 0) + (b.grandTotal || 0);
    });

    const monthlySpendingChart = Object.entries(monthlySpending)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }));

    // ═══ FAVORITE HOUR (for chart) ═══
    const hourCounts: number[] = new Array(24).fill(0);
    allSessions.forEach(s => {
      const hour = new Date(s.createdAt).getHours();
      hourCounts[hour]++;
    });
    const favoriteHoursChart = hourCounts.map((count, hour) => ({ hour: `${hour}:00`, orders: count }));

    // ═══ FAVORITE RESTAURANT ═══
    const restCounts: Record<string, number> = {};
    allSessions.forEach((s: any) => {
      const restId = s.restaurantId?.toString();
      if (restId) restCounts[restId] = (restCounts[restId] || 0) + 1;
    });
    const topRestId = Object.entries(restCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    let favoriteRestaurant = null;
    if (topRestId) {
      const rest = await Restaurant.findById(topRestId, "name bannerImage").lean();
      if (rest) favoriteRestaurant = { ...(rest as any), visits: restCounts[topRestId] };
    }

    // ═══ FAVORITE ITEM ═══
    const allOrders = await Order.find({ sessionId: { $in: allSessionIds }, status: { $ne: "cancelled" } }).lean();
    const itemCounts: Record<string, { count: number; name: string }> = {};
    allOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.name;
        if (name) {
          if (!itemCounts[name]) itemCounts[name] = { count: 0, name };
          itemCounts[name].count += item.quantity || 1;
        }
      });
    });
    const favoriteItem = Object.values(itemCounts).sort((a, b) => b.count - a.count)[0] || null;

    // ═══ LOYALTY PROGRESS ═══
    const tierThresholds = { bronze: 500, silver: 2000, gold: 5000, platinum: Infinity };
    const currentTier = user.rewardTier || "bronze";
    const currentPoints = user.loyaltyPoints || 0;
    const nextThreshold = tierThresholds[currentTier as keyof typeof tierThresholds] || 500;
    const loyaltyProgress = nextThreshold !== Infinity
      ? Math.min(100, Math.round((currentPoints / nextThreshold) * 100))
      : 100;

    // ═══ RECOMMENDATIONS (Data-Driven) ═══
    let recommendations: any[] = [];
    try {
      recommendations = await CustomerRecommendationEngine.generateForCustomer(decoded.userId);
    } catch (e) {
      console.error("Recommendation engine error:", e);
    }

    // ═══ ACHIEVEMENT DEFINITIONS ═══
    const allAchievements = [
      { id: "first_order", label: "First Order 🎉", description: "Place your first order", threshold: "1 order" },
      { id: "ten_orders", label: "10 Orders 🔥", description: "Place 10 orders", threshold: "10 orders" },
      { id: "fifty_orders", label: "50 Orders 💎", description: "Place 50 orders", threshold: "50 orders" },
      { id: "food_explorer", label: "Food Explorer 🌍", description: "Visit 5 different restaurants", threshold: "5 restaurants" },
      { id: "loyal_customer", label: "Loyal Customer ❤️", description: "Place 20 orders", threshold: "20 orders" },
      { id: "big_spender", label: "Big Spender 💰", description: "Spend ₹10,000+", threshold: "₹10,000" },
      { id: "weekend_foodie", label: "Weekend Foodie 🍕", description: "Order mostly on weekends", threshold: ">50% weekend" },
      { id: "early_bird", label: "Early Bird 🌅", description: "Your favorite time is before noon", threshold: "Before 12 PM" },
      { id: "night_owl", label: "Night Owl 🦉", description: "Your favorite time is after 9 PM", threshold: "After 9 PM" },
      { id: "vip", label: "VIP Customer 👑", description: "30+ orders and ₹15,000+ spent", threshold: "30 orders, ₹15K" },
    ];

    const achievements = allAchievements.map(a => ({
      ...a,
      unlocked: (user.achievements || []).includes(a.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          profileImage: user.profileImage || "",
          totalSpent: user.totalSpent || 0,
          totalOrders: user.totalOrders || 0,
          averageOrderValue: user.averageOrderValue || 0,
          lastOrderDate: user.lastOrderDate || null,
          visitFrequency: user.visitFrequency || 0,
          loyaltyPoints: currentPoints,
          rewardTier: currentTier,
          customerSegment: user.customerSegment || "new_customer",
          lifetimeValue: user.lifetimeValue || 0,
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
             orders.forEach((order: any) => {
               if (order.status !== 'cancelled') {
                 itemsCount += order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                 total += order.grandTotal || 0;
               }
             });
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
        // New data-driven fields
        monthlySpendingChart,
        favoriteHoursChart,
        favoriteRestaurant,
        favoriteItem,
        loyaltyProgress: {
          currentPoints,
          currentTier,
          nextThreshold: nextThreshold !== Infinity ? nextThreshold : null,
          progressPercent: loyaltyProgress,
        },
        achievements,
        recommendations,
      }
    });

  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
