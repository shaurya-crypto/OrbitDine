import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import RestaurantModel from "@/models/Restaurant";
import MenuItemModel from "@/models/MenuItem";
import { calculateCartTotals } from "@/lib/services/cartService";
import { eventBus } from "@/lib/services/eventBus";

const addSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
  menuItemId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid menuItemId" }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  addons: z.array(
    z.object({
      name: z.string(),
      price: z.number(), // The frontend sends a price, but we will validate it
    })
  ).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  let dbSession;
  try {
    await dbConnect();
    
    const body = await req.json();
    const result = addSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sessionId, menuItemId, quantity, addons, notes } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    // 1. Fetch Session
    const session = await OrderSessionModel.findById(sessionId).session(dbSession);
    if (!session || session.status !== "active") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    // 2. Fetch Restaurant
    const restaurant = await RestaurantModel.findById(session.restaurantId).lean();
    if (!restaurant) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
    }

    // 3. Fetch MenuItem and validate
    const menuItem = await MenuItemModel.findById(menuItemId).lean();
    if (!menuItem) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 });
    }

    if (menuItem.restaurantId.toString() !== session.restaurantId.toString()) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Item does not belong to this restaurant" }, { status: 400 });
    }

    if (!menuItem.available) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Item is currently unavailable" }, { status: 400 });
    }

    // 4. Validate Addons to prevent price tampering
    const validatedAddons: Array<{ name: string; price: number }> = [];
    if (addons && addons.length > 0 && menuItem.addons) {
      for (const reqAddon of addons) {
        const dbAddon = menuItem.addons.find((a: any) => a.name === reqAddon.name);
        if (dbAddon) {
          // Use the price from the DB, ignoring whatever the frontend sent
          validatedAddons.push({ name: dbAddon.name, price: dbAddon.price });
        }
      }
    }

    // 4.5 Evaluate Price Hike
    let currentPrice = menuItem.price;
    const now = new Date();
    if (menuItem.priceHike?.active && menuItem.priceHike.startTime && menuItem.priceHike.endTime) {
      const start = new Date(menuItem.priceHike.startTime);
      const end = new Date(menuItem.priceHike.endTime);
      if (now >= start && now <= end && menuItem.priceHike.newPrice) {
        currentPrice = menuItem.priceHike.newPrice;
      }
    }

    // 5. Create Cart Item Snapshot
    const cartItem = {
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: currentPrice, // Uses surge price if active
      image: menuItem.image,
      category: menuItem.categoryId.toString(), // Storing as string for snapshot
      quantity,
      addons: validatedAddons,
      notes,
      itemTotal: 0, // Will be calculated by service
    };

    session.cart.push(cartItem as any);

    // 6. Calculate Totals and Update Snapshot
    const totals = calculateCartTotals(session, restaurant);

    await session.save({ session: dbSession });
    await dbSession.commitTransaction();
    dbSession.endSession();

    // 7. Emit Events
    eventBus.emitCartItemAdded({
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
      message: "Item added to cart",
      data: totals,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cart Add Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to add item to cart", error: error.message }, { status: 500 });
  }
}
