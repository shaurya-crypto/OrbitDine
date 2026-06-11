import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderModel from "@/models/Order";
import OrderSessionModel from "@/models/OrderSession";
import { eventBus } from "@/lib/services/eventBus";

const cancelSchema = z.object({
  orderId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid orderId" }),
  itemId: z.string().optional().refine((val) => !val || mongoose.Types.ObjectId.isValid(val), { message: "Invalid itemId" }),
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

    const { orderId, itemId, reason } = result.data;

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

    if (itemId) {
      const itemIndex = order.items.findIndex((i: any) => i._id.toString() === itemId);
      if (itemIndex === -1) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "Item not found in order" }, { status: 404 });
      }

      const itemToCancel = order.items[itemIndex];
      const itemCost = itemToCancel.price * itemToCancel.quantity + 
        (itemToCancel.addons?.reduce((sum: number, a: any) => sum + a.price, 0) || 0) * itemToCancel.quantity;

      // Remove the item
      order.items.splice(itemIndex, 1);

      if (order.items.length === 0) {
        // If no items left, cancel the whole order
        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", timestamp: new Date() });
        order.subtotal = 0;
        order.tax = 0;
        order.serviceCharge = 0;
        order.grandTotal = 0;
      } else {
        // Recalculate totals based on remaining items
        const newSubtotal = order.items.reduce((total: number, item: any) => {
          const addonsCost = item.addons?.reduce((sum: number, a: any) => sum + a.price, 0) || 0;
          return total + (item.price + addonsCost) * item.quantity;
        }, 0);

        // Calculate implicit percentages from original order or default to 0
        const taxRate = order.subtotal > 0 ? order.tax / order.subtotal : 0;
        const serviceRate = order.subtotal > 0 ? order.serviceCharge / order.subtotal : 0;

        order.subtotal = newSubtotal;
        order.tax = newSubtotal * taxRate;
        order.serviceCharge = newSubtotal * serviceRate;
        order.grandTotal = order.subtotal + order.tax + order.serviceCharge - order.discount;
      }

      if (reason) {
        order.notes = order.notes ? `${order.notes} | Item Cancelled: ${reason}` : `Item Cancelled: ${reason}`;
      }

      await order.save({ session: dbSession });
    } else {
      // Cancel the whole order
      order.status = "cancelled";
      order.statusHistory.push({
        status: "cancelled",
        timestamp: new Date(),
      });

      if (reason) {
        order.notes = order.notes ? `${order.notes} | Cancel Reason: ${reason}` : `Cancel Reason: ${reason}`;
      }

      await order.save({ session: dbSession });
    }

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
