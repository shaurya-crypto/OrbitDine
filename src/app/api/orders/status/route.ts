import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderModel from "@/models/Order";
import { eventBus } from "@/lib/services/eventBus";

const updateStatusSchema = z.object({
  orderId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid orderId" }),
  status: z.enum(["received", "preparing", "ready", "served"]),
  servedBy: z.string().optional().refine((val) => !val || mongoose.Types.ObjectId.isValid(val), { message: "Invalid servedBy ID" }),
});

export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const result = updateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { orderId, status, servedBy } = result.data;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json({ success: false, message: "Cannot update a cancelled order" }, { status: 400 });
    }

    // Update status and audit trail
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
    });

    if (status === "served") {
      order.servedAt = new Date();
      if (servedBy) {
        order.servedBy = servedBy;
      }
    }

    await order.save();

    const now = new Date();

    // Broadcast Real-Time Events
    eventBus.emitOrderStatusChanged({
      orderId: order._id.toString(),
      restaurantId: order.restaurantId.toString(),
      tableId: order.tableId?.toString(),
      status: order.status,
      timestamp: now,
    });

    eventBus.emitKitchenQueueUpdated({
      restaurantId: order.restaurantId.toString(),
      message: `Order ${order.orderNumber} is now ${status}`,
      timestamp: now,
    });

    // Notify staff if food is ready to be served
    if (status === "ready") {
      eventBus.emitStaffNotification({
        restaurantId: order.restaurantId.toString(),
        message: `Order ${order.orderNumber} is READY to be served!`,
        timestamp: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update status", error: error.message }, { status: 500 });
  }
}
