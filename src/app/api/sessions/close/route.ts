import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import TableModel from "@/models/Table";
import OrderSessionModel from "@/models/OrderSession";
import { eventBus } from "@/lib/services/eventBus";
import { pusherServer } from "@/lib/pusher/server";
import { syncAfterSessionClose } from "@/lib/services/UserSyncService";
import AnalyticsEvent from "@/models/AnalyticsEvent";

const closeSchema = z.object({
  sessionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid sessionId",
  }),
});

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = closeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { sessionId } = result.data;
  let retries = 3;

  while (retries > 0) {
    let dbSession;
    try {
      await dbConnect();

      dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      // 1. Find Session
      const orderSession = await OrderSessionModel.findById(sessionId).session(dbSession);
      if (!orderSession) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
      }

      if (orderSession.status !== "active") {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ success: false, message: "Session is already closed or cancelled" }, { status: 400 });
      }

      // 2. Mark Session as Completed
      orderSession.status = "completed";
      orderSession.endedAt = new Date();
      await orderSession.save({ session: dbSession });

      // 3. Update Table Status
      const table = await TableModel.findById(orderSession.tableId).session(dbSession);
      if (table) {
        table.activeSessionId = undefined;
        table.status = "available";
        await table.save({ session: dbSession });
      }

      // 4. Commit Transaction
      await dbSession.commitTransaction();
      dbSession.endSession();

      // 5. Sync ALL user statistics from source-of-truth (outside transaction, idempotent)
      if (orderSession.userId) {
        syncAfterSessionClose(orderSession.userId).catch(err => {
          console.error("UserSyncService error (non-blocking):", err);
        });

        // Track analytics event
        AnalyticsEvent.create({
          restaurantId: orderSession.restaurantId,
          customerId: orderSession.userId,
          eventType: "checkout" as any,
          metadata: { sessionId, tableId: orderSession.tableId?.toString() }
        }).catch(() => {});
      }

      // 6. Broadcast Real-Time Event for Restaurant Dashboard
      eventBus.emitTableStatusChanged({
        tableId: orderSession.tableId.toString(),
        restaurantId: orderSession.restaurantId.toString(),
        status: "available",
        timestamp: new Date(),
      });

      // 7. Broadcast to the specific customer session
      await pusherServer.trigger(`private-session-${sessionId}`, "session_completed", { 
        restaurantId: orderSession.restaurantId.toString() 
      });

      return NextResponse.json(
        {
          success: true,
          message: "Session closed and table reset successfully",
        },
        { status: 200 }
      );
    } catch (error: any) {
      if (dbSession) {
        await dbSession.abortTransaction();
        dbSession.endSession();
      }
      
      if (error.hasErrorLabel && error.hasErrorLabel("TransientTransactionError") && retries > 1) {
        retries--;
        console.warn(`TransientTransactionError in close session, retrying... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 200));
        continue;
      }

      console.error("Close Session Error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to close session", error: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: false, message: "Max retries reached" }, { status: 500 });
}
