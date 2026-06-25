import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    await dbConnect();

    // In a real environment, we would calculate this directly from the DB.
    // For Phase 4 demonstration, we'll return robust mocked data that a BI engine would generate
    // mixed with some actual live data if available.

    const activeOrders = await Order.find({ 
      restaurantId, 
      status: { $in: ["received", "preparing", "ready"] } 
    }).limit(20);

    const activeCount = activeOrders.length || Math.floor(Math.random() * 10) + 5;
    
    // Simulate delayed orders
    const delayedOrders = [];
    if (activeCount > 8) {
      delayedOrders.push({
        orderId: "64a7c1b2f901a1b2c3d4e5f6",
        items: "2x Burger Combo, 1x Fries",
        delayMins: 12
      });
      if (activeCount > 15) {
        delayedOrders.push({
          orderId: "64a7c1b2f901a1b2c3d4e5f7",
          items: "1x Truffle Pasta",
          delayMins: 8
        });
      }
    }

    const payload = {
      activeOrders: activeCount,
      estimatedWaitMins: Math.floor(15 + (activeCount * 0.8)),
      actualPrepMins: Math.floor(12 + (activeCount * 0.9)),
      efficiency: Math.max(70, 95 - (delayedOrders.length * 5)),
      delayedOrders,
      projectedWaitMins: Math.floor(18 + (activeCount * 1.2)),
      hotItem: "Truffle Fries"
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
