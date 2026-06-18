import { NextRequest, NextResponse } from "next/server";
import { withIdempotency } from "@/lib/idempotency";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import OrderSessionModel from "@/models/OrderSession";
import TableModel from "@/models/Table";
import { eventBus } from "@/lib/services/eventBus";

const requestBillSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid sessionId" }),
});

export async function POST(req: NextRequest) {
  return withIdempotency(req, async () => {
    let dbSession;
  try {
    await dbConnect();

    const body = await req.json();
    const result = requestBillSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sessionId } = result.data;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const session = await OrderSessionModel.findById(sessionId).session(dbSession);
    
    if (!session || session.status !== "active") {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    if (session.billRequested) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return NextResponse.json({ success: false, message: "Bill already requested" }, { status: 400 });
    }

    // 1. Update Session
    session.billRequested = true;
    await session.save({ session: dbSession });

    // 2. Update Table Status
    const table = await TableModel.findById(session.tableId).session(dbSession);
    if (table) {
      table.status = "bill_requested";
      await table.save({ session: dbSession });
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    const now = new Date();

    // 3. Broadcast Alerts
    eventBus.emitBillRequested({
      sessionId: session._id.toString(),
      restaurantId: session.restaurantId.toString(),
      tableId: session.tableId.toString(),
      timestamp: now,
    });

    eventBus.emitTableStatusChanged({
      tableId: session.tableId.toString(),
      restaurantId: session.restaurantId.toString(),
      status: "bill_requested",
      timestamp: now,
    });

    eventBus.emitStaffNotification({
      restaurantId: session.restaurantId.toString(),
      message: `Table ${table?.tableNumber} requested the bill.`,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      message: "Bill requested successfully",
    }, { status: 200 });

  } catch (error: any) {
    console.error("Request Bill Error:", error);
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    return NextResponse.json({ success: false, message: "Failed to request bill", error: error.message }, { status: 500 });
  }
  });
}
