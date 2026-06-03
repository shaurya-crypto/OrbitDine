import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import BillModel from "@/models/Bill";
import OrderModel from "@/models/Order";
import TableModel from "@/models/Table";

export async function GET(req: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    await dbConnect();
    const { restaurantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ success: false, message: "Invalid restaurant ID" }, { status: 400 });
    }

    const restId = new mongoose.Types.ObjectId(restaurantId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Revenue Today
    const billsToday = await BillModel.find({
      restaurantId: restId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    const revenueToday = billsToday.reduce((sum, bill) => sum + bill.grandTotal, 0);

    // 2. Orders Today
    const ordersTodayCount = await OrderModel.countDocuments({
      restaurantId: restId,
      status: { $ne: "cancelled" },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // 3. Active Tables
    const activeTablesCount = await TableModel.countDocuments({
      restaurantId: restId,
      status: { $ne: "available" },
    });

    // 4. Avg Order Value
    const avgOrderValue = billsToday.length > 0 ? revenueToday / billsToday.length : 0;

    // 5. Avg Ticket Time (Time from order created to served)
    const ticketTimeAgg = await OrderModel.aggregate([
      {
        $match: {
          restaurantId: restId,
          status: "served",
          servedAt: { $exists: true, $ne: null },
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }
      },
      {
        $project: {
          durationMs: { $subtract: ["$servedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: null,
          avgDurationMs: { $avg: "$durationMs" }
        }
      }
    ]);
    
    // Convert ms to minutes
    const avgTicketTime = ticketTimeAgg.length > 0 ? Math.round(ticketTimeAgg[0].avgDurationMs / 60000) : 0;

    // 6. Top Selling Items Today
    const topItemsAgg = await OrderModel.aggregate([
      {
        $match: {
          restaurantId: restId,
          status: { $ne: "cancelled" },
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const topSellingItems = topItemsAgg.map(item => ({
      name: item._id,
      quantity: item.totalQuantity,
      revenue: item.totalRevenue
    }));

    // 7. Peak Hours Today
    const peakHoursAgg = await OrderModel.aggregate([
      {
        $match: {
          restaurantId: restId,
          status: { $ne: "cancelled" },
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const peakHours = peakHoursAgg.map(ph => ({
      hour: ph._id,
      orders: ph.count
    }));

    return NextResponse.json({
      success: true,
      data: {
        revenueToday,
        ordersToday: ordersTodayCount,
        activeTables: activeTablesCount,
        avgOrderValue,
        avgTicketTime,
        billsPending: billsToday.filter(b => b.status === "unpaid").length,
        topSellingItems,
        peakHours
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Get Overview Error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve overview stats", error: error.message }, { status: 500 });
  }
}
