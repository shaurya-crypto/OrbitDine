import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Order from "@/models/Order";
import { verifyAccessToken } from "@/lib/auth/jwt";
import mongoose from "mongoose";

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

    let restaurantObjId: mongoose.Types.ObjectId;
    try {
      restaurantObjId = new mongoose.Types.ObjectId(restaurantId);
    } catch {
      return NextResponse.json({ error: "Invalid restaurantId" }, { status: 400 });
    }

    // Today's date boundary
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Today's metrics
    const todayOrders = await Order.find({
      restaurantId: restaurantObjId,
      createdAt: { $gte: startOfDay }
    });

    let revenueToday = 0;
    let totalOrdersToday = 0;
    const orderStatusBreakdown = {
      received: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      cancelled: 0
    };

    todayOrders.forEach(order => {
      const status = order.status as keyof typeof orderStatusBreakdown;
      if (orderStatusBreakdown[status] !== undefined) {
        orderStatusBreakdown[status]++;
      }
      if (status !== "cancelled") {
        revenueToday += order.grandTotal;
        totalOrdersToday++;
      }
    });

    const averageOrderValueToday = totalOrdersToday > 0 ? revenueToday / totalOrdersToday : 0;
    
    // 2. Popular Items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularItemsAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantObjId, createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // 3. Hourly Revenue (Today)
    const hourlyAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" } } },
      { $group: { 
          _id: { $hour: "$createdAt" }, 
          revenue: { $sum: "$grandTotal" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      revenue: hourlyAggregation.find(h => h._id === i)?.revenue || 0
    }));

    // 4. Last 7 Days Revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAggregation = await Order.aggregate([
      { $match: { restaurantId: restaurantObjId, createdAt: { $gte: sevenDaysAgo }, status: { $ne: "cancelled" } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyAggregation.find(h => h._id === dateStr);
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayData?.revenue || 0,
        orders: dayData?.orders || 0
      };
    });

    const revenueThisWeek = dailyAggregation.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrdersThisWeek = dailyAggregation.reduce((sum, d) => sum + d.orders, 0);
    
    return NextResponse.json({ 
      revenueToday,
      totalOrdersToday,
      averageOrderValueToday,
      revenueThisWeek,
      totalOrdersThisWeek,
      orderStatusBreakdown,
      popularItems: popularItemsAggregation,
      hourlyData,
      last7DaysData
    }, { status: 200 });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
