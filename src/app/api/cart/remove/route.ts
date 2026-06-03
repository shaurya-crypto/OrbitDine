import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import RestaurantModel from "@/models/Restaurant";
import { calculateCartTotals } from "@/lib/services/cartService";
import { eventBus } from "@/lib/services/eventBus";

const removeSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
  cartItemId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid cartItemId" }),
});

export async function POST(req: Request) {
  let dbSession;
  try {
    await dbConnect();
    
    const body = await req.json();
    const result = removeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sessionId, cartItemId } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const session = await OrderSessionModel.findById(sessionId).session(dbSession);
    if (!session || session.status !== "active") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    // Pull the item from the cart
    session.cart.pull(cartItemId);

    const restaurant = await RestaurantModel.findById(session.restaurantId).lean();
    if (!restaurant) throw new Error("Restaurant not found");

    const totals = calculateCartTotals(session, restaurant);

    await session.save({ session: dbSession });
    await dbSession.commitTransaction();
    dbSession.endSession();

    eventBus.emitCartItemRemoved({
      sessionId: session._id.toString(),
      restaurantId: session.restaurantId.toString(),
      tableId: session.tableId.toString(),
      timestamp: new Date(),
    });

    eventBus.emitCartUpdated({
      sessionId: session._id.toString(),
      restaurantId: session.restaurantId.toString(),
      tableId: session.tableId.toString(),
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      data: totals,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cart Remove Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to remove item", error: error.message }, { status: 500 });
  }
}
