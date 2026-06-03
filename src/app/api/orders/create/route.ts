import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import OrderModel from "@/models/Order";
import RestaurantModel from "@/models/Restaurant";
import TableModel from "@/models/Table";
import { calculateCartTotals } from "@/lib/services/cartService";
import { eventBus } from "@/lib/services/eventBus";
import crypto from "crypto";

const createOrderSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  let dbSession;
  try {
    await dbConnect();

    const body = await req.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sessionId, notes } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const orderSession = await OrderSessionModel.findById(sessionId).session(dbSession);
    
    if (!orderSession || orderSession.status !== "active") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    if (orderSession.cart.length === 0) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    const restaurant = await RestaurantModel.findById(orderSession.restaurantId).lean();
    if (!restaurant) throw new Error("Restaurant not found");

    // 1. Calculate final totals from cart snapshot
    const totals = calculateCartTotals(orderSession, restaurant);

    // 2. Generate unique order number (e.g., ORB-A1B2C)
    const orderNumber = `ORB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 3. Create the Order document atomically
    const [newOrder] = await OrderModel.create(
      [
        {
          orderNumber,
          restaurantId: orderSession.restaurantId,
          tableId: orderSession.tableId,
          sessionId: orderSession._id,
          items: orderSession.cart, // Snapshot transfer
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          serviceCharge: totals.serviceCharge,
          grandTotal: totals.grandTotal,
          status: "received",
          statusHistory: [
            {
              status: "received",
              timestamp: new Date(),
            },
          ],
          notes,
        },
      ],
      { session: dbSession }
    );

    // Update Table status to "preparing"
    if (orderSession.tableId) {
      await TableModel.findByIdAndUpdate(
        orderSession.tableId,
        { status: "preparing" },
        { session: dbSession }
      );
    }

    // 4. Update the OrderSession
    orderSession.orderIds.push(newOrder._id);
    orderSession.cart = []; // Empty the cart after successful order creation
    await orderSession.save({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    // 5. Fire Real-Time Operational Events
    const now = new Date();
    
    eventBus.emitOrderCreated({
      orderId: newOrder._id.toString(),
      restaurantId: orderSession.restaurantId.toString(),
      tableId: orderSession.tableId.toString(),
      status: "received",
      timestamp: now,
    });

    eventBus.emitKitchenQueueUpdated({
      restaurantId: orderSession.restaurantId.toString(),
      message: `New Order Received: ${orderNumber}`,
      timestamp: now,
    });

    eventBus.emitStaffNotification({
      restaurantId: orderSession.restaurantId.toString(),
      message: `Table requires attention: Order ${orderNumber}`,
      timestamp: now,
    });

    eventBus.emitCartCleared({
      sessionId: orderSession._id.toString(),
      restaurantId: orderSession.restaurantId.toString(),
      tableId: orderSession.tableId.toString(),
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Create Order Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to place order", error: error.message }, { status: 500 });
  }
}
