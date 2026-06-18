import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb/db";
import Order from "@/models/Order";
import OrderSession from "@/models/OrderSession";
import MenuItem from "@/models/MenuItem";
import Review from "@/models/Review";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!payload.roles.includes("owner") && !payload.roles.includes("manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const section = searchParams.get("section") || "summary";
    const timeRange = searchParams.get("timeRange") || "today"; // today, week, month, year, all

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();

    let restaurantObjId: mongoose.Types.ObjectId;
    try {
      restaurantObjId = new mongoose.Types.ObjectId(restaurantId);
    } catch {
      return NextResponse.json({ error: "Invalid restaurantId" }, { status: 400 });
    }

    // Determine Date Boundaries
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();

    if (timeRange === "today") {
      startDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(startDate);
    } else if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate = new Date(startDate);
    } else if (timeRange === "month") {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      previousEndDate = new Date(startDate);
    } else if (timeRange === "year") {
      startDate.setDate(now.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 365);
      previousEndDate = new Date(startDate);
    } else if (timeRange === "all") {
      startDate = new Date(0);
      previousStartDate = new Date(0);
      previousEndDate = new Date(0);
    }

    // --- SUMMARY SECTION (For the Main Dashboard) ---
    if (section === "summary") {
      const todayOrders = await Order.find({
        restaurantId: restaurantObjId,
        createdAt: { $gte: startDate }
      });

      let revenueToday = 0;
      let totalOrdersToday = 0;
      let pendingOrders = 0;

      todayOrders.forEach(order => {
        if (order.status !== "cancelled") {
          revenueToday += order.grandTotal;
          totalOrdersToday++;
          if (["received", "preparing"].includes(order.status)) pendingOrders++;
        }
      });

      const activeTablesCount = await OrderSession.countDocuments({
        restaurantId: restaurantObjId,
        status: "active"
      });

      // Popular item today
      const popularItemTodayAgg = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 1 }
      ]);
      const topSellingItem = popularItemTodayAgg.length > 0 ? popularItemTodayAgg[0]._id : "None";

      // Reviews
      const recentReviews = await Review.find({ restaurantId: restaurantObjId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "fullName");
      
      const allReviews = await Review.aggregate([
        { $match: { restaurantId: restaurantObjId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);
      const averageRating = allReviews.length > 0 ? allReviews[0].avgRating.toFixed(1) : "0.0";

      // Hourly data for sparkline
      const hourlyAggregation = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $hour: "$createdAt" }, revenue: { $sum: "$grandTotal" } } },
        { $sort: { _id: 1 } }
      ]);

      const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
        hour: `${i}:00`,
        revenue: hourlyAggregation.find(h => h._id === i)?.revenue || 0
      }));

      // Peak hour today
      const peakHour = hourlyAggregation.length > 0 ? `${hourlyAggregation[0]._id}:00` : "N/A";

      // Staff activity (basic summary for now)
      const onlineStaff = await User.countDocuments({ roles: { $in: ["staff", "kitchen", "manager"] } });

      return NextResponse.json({
        revenueToday,
        totalOrdersToday,
        activeTables: activeTablesCount,
        pendingOrders,
        averageRating,
        topSellingItem,
        peakHour,
        recentReviews,
        hourlyData,
        staffActivity: { online: onlineStaff }
      }, { status: 200 });
    }


    // --- 1. REVENUE ANALYTICS ---
    if (section === "revenue") {
      const ordersInPeriod = await Order.find({ restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } });
      const ordersInPrevPeriod = await Order.find({ restaurantId: restaurantObjId, createdAt: { $gte: previousStartDate, $lt: previousEndDate }, status: { $ne: "cancelled" } });

      const revenuePeriod = ordersInPeriod.reduce((sum, o) => sum + o.grandTotal, 0);
      const prevRevenuePeriod = ordersInPrevPeriod.reduce((sum, o) => sum + o.grandTotal, 0);
      const growthPct = prevRevenuePeriod > 0 ? ((revenuePeriod - prevRevenuePeriod) / prevRevenuePeriod) * 100 : (revenuePeriod > 0 ? 100 : 0);

      // Group by day for line/area chart
      const dailyAggregation = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$grandTotal" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      const chartData = dailyAggregation.map(d => ({
        date: d._id,
        revenue: d.revenue,
        orders: d.orders
      }));

      return NextResponse.json({
        revenuePeriod,
        prevRevenuePeriod,
        growthPct: growthPct.toFixed(1),
        chartData
      }, { status: 200 });
    }

    // --- 2. ORDER ANALYTICS ---
    if (section === "orders") {
      const allOrders = await Order.find({ restaurantId: restaurantObjId, createdAt: { $gte: startDate } });
      const totalOrders = allOrders.length;
      
      const statusBreakdown = { received: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
      let validRevenue = 0;
      let validOrdersCount = 0;

      allOrders.forEach(o => {
        const s = o.status as keyof typeof statusBreakdown;
        if (statusBreakdown[s] !== undefined) statusBreakdown[s]++;
        if (s !== "cancelled") {
          validRevenue += o.grandTotal;
          validOrdersCount++;
        }
      });

      const aov = validOrdersCount > 0 ? validRevenue / validOrdersCount : 0;
      const cancellationRate = totalOrders > 0 ? (statusBreakdown.cancelled / totalOrders) * 100 : 0;
      const completionRate = totalOrders > 0 ? (statusBreakdown.served / totalOrders) * 100 : 0;

      return NextResponse.json({
        totalOrders,
        statusBreakdown,
        aov,
        cancellationRate: cancellationRate.toFixed(1),
        completionRate: completionRate.toFixed(1)
      }, { status: 200 });
    }

    // --- 3. MENU ANALYTICS ---
    if (section === "menu") {
      const itemAggregation = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $group: { 
            _id: "$items.name", 
            totalSold: { $sum: "$items.quantity" }, 
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } 
        }},
        { $sort: { totalSold: -1 } }
      ]);

      const topSellers = itemAggregation.slice(0, 10);
      const worstSellers = [...itemAggregation].sort((a,b) => a.totalSold - b.totalSold).slice(0, 10);

      return NextResponse.json({
        topSellers,
        worstSellers,
        allStats: itemAggregation
      }, { status: 200 });
    }

    // --- 4. CUSTOMER ANALYTICS ---
    if (section === "customers") {
      // For now we look at unique sessions vs unique registered users
      const sessions = await OrderSession.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate } } },
        { $group: { _id: "$userId", count: { $sum: 1 }, totalSpend: { $sum: { $sum: "$cart.itemTotal" } } } }
      ]);

      let registeredVisits = 0;
      let guestVisits = 0;
      let returningCustomers = 0;

      sessions.forEach(s => {
        if (s._id) {
          registeredVisits += s.count;
          if (s.count > 1) returningCustomers++;
        } else {
          guestVisits += s.count;
        }
      });

      return NextResponse.json({
        totalCustomers: sessions.length,
        returningCustomers,
        newCustomers: sessions.length - returningCustomers,
        repeatVisitRate: sessions.length > 0 ? ((returningCustomers / sessions.length) * 100).toFixed(1) : 0,
        registeredVisits,
        guestVisits
      }, { status: 200 });
    }

    // --- 5. FEEDBACK ANALYTICS ---
    if (section === "feedback") {
      const reviews = await Review.find({ restaurantId: restaurantObjId, createdAt: { $gte: startDate } });
      const count = reviews.length;
      let sum = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      reviews.forEach(r => {
        sum += r.rating;
        distribution[r.rating as keyof typeof distribution]++;
      });

      const avgRating = count > 0 ? (sum / count).toFixed(1) : 0;
      const positiveReviews = distribution[4] + distribution[5];
      const negativeReviews = distribution[1] + distribution[2];

      const reviewTrend = await Review.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      return NextResponse.json({
        count,
        avgRating,
        distribution,
        positiveReviews,
        negativeReviews,
        reviewTrend
      }, { status: 200 });
    }

    // --- 6. DISCOVERY ANALYTICS ---
    if (section === "discovery") {
      const events = await AnalyticsEvent.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate } } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } }
      ]);

      const eventMap = {
        restaurant_view: 0,
        menu_open: 0,
        item_view: 0,
        item_click: 0,
        add_to_cart: 0
      };

      events.forEach(e => {
        if (eventMap[e._id as keyof typeof eventMap] !== undefined) {
          eventMap[e._id as keyof typeof eventMap] = e.count;
        }
      });

      return NextResponse.json({
        events: eventMap
      }, { status: 200 });
    }

    // --- 7. TABLE ANALYTICS ---
    if (section === "tables") {
      const sessions = await OrderSession.find({ restaurantId: restaurantObjId, createdAt: { $gte: startDate } });
      let totalDurationMs = 0;
      let completedSessions = 0;

      sessions.forEach(s => {
        if (s.endedAt) {
          totalDurationMs += s.endedAt.getTime() - s.startedAt.getTime();
          completedSessions++;
        }
      });

      const avgSessionDurationMins = completedSessions > 0 ? (totalDurationMs / completedSessions) / 60000 : 0;

      // Table utilization
      const utilization = await OrderSession.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate } } },
        { $group: { _id: "$tableId", sessionCount: { $sum: 1 } } }
      ]);

      return NextResponse.json({
        avgSessionDurationMins: Math.round(avgSessionDurationMins),
        totalSessions: sessions.length,
        tableUtilization: utilization
      }, { status: 200 });
    }

    // --- 8. TIME ANALYTICS ---
    if (section === "time") {
      const hourlyAggregation = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $group: { _id: { dayOfWeek: { $dayOfWeek: "$createdAt" }, hour: { $hour: "$createdAt" } }, orders: { $sum: 1 } } },
      ]);

      const peakHourAgg = await Order.aggregate([
        { $match: { restaurantId: restaurantObjId, createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $hour: "$createdAt" }, orders: { $sum: 1 } } },
        { $sort: { orders: -1 } },
        { $limit: 1 }
      ]);

      return NextResponse.json({
        heatmap: hourlyAggregation,
        peakHour: peakHourAgg.length > 0 ? `${peakHourAgg[0]._id}:00` : "N/A"
      }, { status: 200 });
    }

    // --- 9. OPERATIONAL PERFORMANCE ---
    if (section === "operational") {
      const orders = await Order.find({ restaurantId: restaurantObjId, createdAt: { $gte: startDate } });
      let prepTimeTotalMs = 0;
      let prepTimeCount = 0;

      let serveTimeTotalMs = 0;
      let serveTimeCount = 0;

      orders.forEach(o => {
        const received = o.statusHistory.find((h: any) => h.status === "received");
        const ready = o.statusHistory.find((h: any) => h.status === "ready");
        const served = o.statusHistory.find((h: any) => h.status === "served");

        if (received && ready) {
          prepTimeTotalMs += ready.timestamp.getTime() - received.timestamp.getTime();
          prepTimeCount++;
        }
        if (ready && served) {
          serveTimeTotalMs += served.timestamp.getTime() - ready.timestamp.getTime();
          serveTimeCount++;
        }
      });

      return NextResponse.json({
        avgPrepTimeMins: prepTimeCount > 0 ? Math.round((prepTimeTotalMs / prepTimeCount) / 60000) : 0,
        avgServeTimeMins: serveTimeCount > 0 ? Math.round((serveTimeTotalMs / serveTimeCount) / 60000) : 0,
        totalOrdersProcessed: orders.length
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
