import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Order from "@/models/Order";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();

    // Today's date boundary
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Total Revenue Today
    const todayOrders = await Order.find({
      restaurantId,
      createdAt: { $gte: startOfDay },
      status: { $ne: "cancelled" }
    });

    const revenueToday = todayOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    const totalOrdersToday = todayOrders.length;
    
    // 2. Popular Items (All time or last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularItemsAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantId, createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // 3. Hourly Revenue (Today)
    const hourlyAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantId, createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" } } },
      { $group: { 
          _id: { $hour: "$createdAt" }, 
          revenue: { $sum: "$grandTotal" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Format hourly data for charts
    const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      revenue: hourlyAggregation.find(h => h._id === i)?.revenue || 0
    }));

    // 4. Last 7 Days Revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantId, createdAt: { $gte: sevenDaysAgo }, status: { $ne: "cancelled" } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          revenue: { $sum: "$grandTotal" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Format 7 days data
    const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyAggregation.find(h => h._id === dateStr)?.revenue || 0
      };
    });

    // If manager, we might strip out total historical revenue, but let's give them today's stats for now.
    
    return NextResponse.json({ 
      revenueToday,
      totalOrdersToday,
      popularItems: popularItemsAggregation,
      hourlyData,
      last7DaysData
    }, { status: 200 });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
