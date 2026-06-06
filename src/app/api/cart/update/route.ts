import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import RestaurantModel from "@/models/Restaurant";
import { calculateCartTotals } from "@/lib/services/cartService";
import { eventBus } from "@/lib/services/eventBus";

const updateSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
  cartItemId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid cartItemId" }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export async function POST(req: Request) {
  let dbSession;
  try {
    await dbConnect();
    
    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sessionId, cartItemId, quantity } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const session = await OrderSessionModel.findById(sessionId).session(dbSession);
    if (!session || session.status !== "active") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    // Find the item in the cart
    const item = session.cart.find((i: any) => i._id.toString() === cartItemId);
    if (!item) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Item not found in cart" }, { status: 404 });
    }

    // Update quantity
    item.quantity = quantity;

    const restaurant = await RestaurantModel.findById(session.restaurantId).lean();
    if (!restaurant) throw new Error("Restaurant not found");

    const totals = calculateCartTotals(session, restaurant);

    await session.save({ session: dbSession });
    await dbSession.commitTransaction();
    dbSession.endSession();

    eventBus.emitCartUpdated({
      sessionId: session._id.toString(),
      restaurantId: session.restaurantId.toString(),
      tableId: session.tableId.toString(),
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      data: totals,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cart Update Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to update cart", error: error.message }, { status: 500 });
  }
}
