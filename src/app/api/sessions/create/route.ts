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
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { code } = result.data;
  let retries = 3;

  while (retries > 0) {
    let session;
    try {
      await dbConnect();
      session = await mongoose.startSession();
      session.startTransaction();

      // 1. QR Validation
      const qrRecord = await QRCodeModel.findOne({ code, active: true }).session(session);
      if (!qrRecord) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ success: false, message: "Invalid or inactive QR code" }, { status: 404 });
      }

      const { restaurantId, tableId } = qrRecord;

      // Update QR metrics
      qrRecord.scanCount = (qrRecord.scanCount || 0) + 1;
      qrRecord.lastScanTime = new Date();
      await qrRecord.save({ session });

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
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      
      // Retry on transient transaction errors (WriteConflicts)
      if (error.hasErrorLabel && error.hasErrorLabel("TransientTransactionError") && retries > 1) {
        retries--;
        console.warn(`TransientTransactionError in create session, retrying... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 200)); // Small backoff before retry
        continue;
      }

      console.error("Create Session Error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create session", error: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: false, message: "Max retries reached" }, { status: 500 });
}
