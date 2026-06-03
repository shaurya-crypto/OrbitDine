import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import OrderModel from "@/models/Order";
import RestaurantModel from "@/models/Restaurant";
import BillModel from "@/models/Bill";
import { eventBus } from "@/lib/services/eventBus";
import crypto from "crypto";

const generateBillSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
  override: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = generateBillSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { sessionId, override } = result.data;
  let retries = 3;

  while (retries > 0) {
    let dbSession;
    try {
      await dbConnect();
      dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      // 1. Check for existing bill to prevent regeneration
      const existingBill = await BillModel.findOne({ sessionId }).session(dbSession);
      if (existingBill && !override) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({
          success: true,
          message: "Bill already exists for this session",
          data: existingBill,
        }, { status: 200 });
      }

      // 2. Fetch Session & Orders
      const session = await OrderSessionModel.findById(sessionId).session(dbSession);
      if (!session) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
      }

      const restaurant = await RestaurantModel.findById(session.restaurantId).lean();
      if (!restaurant) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
      }

      // Aggregate all NON-CANCELLED orders for this session
      const orders = await OrderModel.find({
        sessionId,
        status: { $ne: "cancelled" },
      }).session(dbSession);

      if (orders.length === 0 && session.cart.length === 0) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "No active orders found for this session" }, { status: 400 });
      }

      // 3. Compile the Items Snapshot
      let compiledSubtotal = 0;
      const itemsSnapshot: Array<any> = [];
      
      // Process placed orders
      for (const order of orders) {
        for (const item of order.items) {
          let itemBaseTotal = item.price * item.quantity;
          let addonsTotal = 0;
          if (item.addons) {
            for (const addon of item.addons) {
              addonsTotal += addon.price * item.quantity;
            }
          }
          const itemTotal = itemBaseTotal + addonsTotal;
          compiledSubtotal += itemTotal;
          
          itemsSnapshot.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            addons: item.addons || [],
            itemTotal,
          });
        }
      }

      // Also include any items currently in the cart that haven't been ordered yet
      // (If the restaurant allows billing out directly from the cart without hitting 'Order' first)
      for (const item of session.cart) {
        compiledSubtotal += item.itemTotal;
        itemsSnapshot.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          addons: item.addons || [],
          itemTotal: item.itemTotal,
        });
      }

      // 4. Calculate Financials
      const discounts = session.appliedDiscounts || [];
      const totalDiscount = discounts.reduce((sum: number, d: any) => sum + d.amount, 0);

      const taxableAmount = Math.max(0, compiledSubtotal - totalDiscount);
      
      const taxPercentage = restaurant.settings?.taxPercentage || 0;
      const serviceChargePercentage = restaurant.settings?.serviceChargePercentage || 0;

      const tax = (taxableAmount * taxPercentage) / 100;
      const serviceCharge = (taxableAmount * serviceChargePercentage) / 100;
      
      const grandTotal = taxableAmount + tax + serviceCharge;

      // 5. Build the Bill Document
      const billNumber = `INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      // If an override is used and a bill exists, update it. Otherwise create a new one.
      let finalBill;
      
      if (existingBill && override) {
        existingBill.itemsSnapshot = itemsSnapshot;
        existingBill.subtotal = Number(compiledSubtotal.toFixed(2));
        existingBill.discounts = discounts;
        existingBill.totalDiscount = Number(totalDiscount.toFixed(2));
        existingBill.tax = Number(tax.toFixed(2));
        existingBill.serviceCharge = Number(serviceCharge.toFixed(2));
        existingBill.grandTotal = Number(grandTotal.toFixed(2));
        existingBill.orderIds = orders.map((o: any) => o._id);
        await existingBill.save({ session: dbSession });
        finalBill = existingBill;
      } else {
        const [newBill] = await BillModel.create(
          [{
            billNumber,
            restaurantId: session.restaurantId,
            tableId: session.tableId,
            sessionId: session._id,
            orderIds: orders.map((o: any) => o._id),
            itemsSnapshot,
            subtotal: Number(compiledSubtotal.toFixed(2)),
            discounts,
            totalDiscount: Number(totalDiscount.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            serviceCharge: Number(serviceCharge.toFixed(2)),
            grandTotal: Number(grandTotal.toFixed(2)),
            status: "unpaid",
          }],
          { session: dbSession }
        );
        finalBill = newBill;
      }

      // Auto-update Session to reflect bill has been generated (if not already)
      if (!session.billRequested) {
        session.billRequested = true;
        await session.save({ session: dbSession });
      }

      await dbSession.commitTransaction();
      dbSession.endSession();

      // 6. Broadcast Real-Time Alerts
      const now = new Date();
      
      eventBus.emitBillGenerated({
        sessionId: session._id.toString(),
        restaurantId: session.restaurantId.toString(),
        tableId: session.tableId.toString(),
        timestamp: now,
      });

      eventBus.emitManagerNotification({
        restaurantId: session.restaurantId.toString(),
        message: `Table settlement requested. Bill generated: ${finalBill.billNumber}`,
        timestamp: now,
      });

      eventBus.emitOwnerRevenueUpdated({
        restaurantId: session.restaurantId.toString(),
        message: `New bill pending payment: $${finalBill.grandTotal}`,
        timestamp: now,
      });

      return NextResponse.json({
        success: true,
        message: "Bill generated successfully",
        data: finalBill,
      }, { status: 201 });

    } catch (error: any) {
      if (dbSession) {
        await dbSession.abortTransaction();
        dbSession.endSession();
      }
      
      // Retry on transient transaction errors (WriteConflicts)
      if (error.hasErrorLabel && error.hasErrorLabel("TransientTransactionError") && retries > 1) {
        retries--;
        console.warn(`TransientTransactionError in generate bill, retrying... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 200)); // Small backoff before retry
        continue;
      }

      console.error("Generate Bill Error:", error);
      return NextResponse.json({ success: false, message: "Failed to generate bill", error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: "Max retries reached" }, { status: 500 });
}
