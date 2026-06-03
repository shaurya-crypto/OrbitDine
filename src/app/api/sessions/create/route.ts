import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import QRCodeModel from "@/models/QRCode";
import TableModel from "@/models/Table";
import OrderSessionModel from "@/models/OrderSession";
import { eventBus } from "@/lib/services/eventBus";

const createSchema = z.object({
  code: z.string().min(1, "QR code is required"),
});

export async function POST(req: Request) {
  let session;
  try {
    await dbConnect();

    // In Next.js App Router, mongoose transactions work perfectly 
    // as long as the connection is established and the replica set is active.
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await req.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { code } = result.data;

    // 1. QR Validation
    const qrRecord = await QRCodeModel.findOne({ code, active: true }).session(session);
    if (!qrRecord) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ success: false, message: "Invalid or inactive QR code" }, { status: 404 });
    }

    const { restaurantId, tableId } = qrRecord;

    // 2. Table Validation & Check for existing active session (Prevent Duplicates)
    const table = await TableModel.findById(tableId).session(session);
    if (!table) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }

    // If the table already has an active session, return the existing one.
    if (table.activeSessionId && table.status !== "available" && table.status !== "closed") {
      const existingSession = await OrderSessionModel.findById(table.activeSessionId).session(session);
      if (existingSession && existingSession.status === "active") {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json({
          success: true,
          message: "Joined existing session",
          data: existingSession,
        }, { status: 200 });
      }
    }

    // 3. Create new OrderSession
    const [newOrderSession] = await OrderSessionModel.create(
      [
        {
          restaurantId,
          tableId,
          qrCodeId: qrRecord._id,
          status: "active",
          cart: [],
          orderIds: [],
        },
      ],
      { session }
    );

    // 4. Update Table Status
    table.activeSessionId = newOrderSession._id;
    table.status = "ordering";
    await table.save({ session });

    // 5. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // 6. Broadcast Real-Time Event
    eventBus.emitTableStatusChanged({
      tableId: tableId.toString(),
      restaurantId: restaurantId.toString(),
      status: "ordering",
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Session created successfully",
        data: newOrderSession,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Session Error:", error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return NextResponse.json(
      { success: false, message: "Failed to create session", error: error.message },
      { status: 500 }
    );
  }
}
