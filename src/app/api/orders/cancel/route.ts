import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderModel from "@/models/Order";
import OrderSessionModel from "@/models/OrderSession";
import { eventBus } from "@/lib/services/eventBus";

const cancelSchema = z.object({
  orderId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid orderId" }),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  let dbSession;
  try {
    await dbConnect();

    const body = await req.json();
    const result = cancelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { orderId, reason } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const order = await OrderModel.findById(orderId).session(dbSession);
    if (!order) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.status === "served" || order.status === "cancelled") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: `Cannot cancel an order that is ${order.status}` }, { status: 400 });
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
    });

    if (reason) {
      order.notes = order.notes ? `${order.notes} | Cancel Reason: ${reason}` : `Cancel Reason: ${reason}`;
    }

    await order.save({ session: dbSession });

    // Optional: Remove orderId from OrderSession if we want to completely omit it from the bill
    // However, it's safer to keep the reference and let the bill generator ignore 'cancelled' orders.

    await dbSession.commitTransaction();
    dbSession.endSession();

    const now = new Date();

    eventBus.emitOrderStatusChanged({
      orderId: order._id.toString(),
      restaurantId: order.restaurantId.toString(),
      tableId: order.tableId?.toString(),
      status: "cancelled",
      timestamp: now,
    });

    eventBus.emitKitchenQueueUpdated({
      restaurantId: order.restaurantId.toString(),
      message: `Order ${order.orderNumber} CANCELLED`,
      timestamp: now,
    });

    eventBus.emitManagerNotification({
      restaurantId: order.restaurantId.toString(),
      message: `Order ${order.orderNumber} was cancelled.`,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cancel Order Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to cancel order", error: error.message }, { status: 500 });
  }
}
