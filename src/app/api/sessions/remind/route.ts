import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import OrderSession from "@/models/OrderSession";
import { pusherServer } from "@/lib/pusher/server";
import { REALTIME_EVENTS } from "@/lib/constants/realtimeEvents";
import OwnerSetting from "@/models/OwnerSetting";

export async function POST(req: Request) {
  try {
    const { sessionId, type } = await req.json();

    if (!sessionId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const session = await OrderSession.findById(sessionId).populate("tableId");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const pusher = pusherServer;
    let message = "";
    let targetRoles: string[] = [];

    const tableNumber = (session as any).tableId?.tableNumber || "Unknown";
    
    // Fetch dynamic routing settings
    const settings = await OwnerSetting.findOne({ restaurantId: session.restaurantId }).lean();
    if (settings && settings.globalNotificationsEnabled === false) {
      return NextResponse.json({ message: "Notifications globally muted" }, { status: 200 });
    }

    if (type === "food") {
      message = `Table ${tableNumber} is asking about their food preparation status.`;
      targetRoles = settings?.routing?.foodReminder || ["kitchen", "staff", "manager", "owner"];
    } else if (type === "serve") {
      message = `Table ${tableNumber} is waiting for their prepared food to be served.`;
      targetRoles = settings?.routing?.serveReminder || ["staff", "manager", "owner"];
    } else if (type === "bill") {
      message = `Table ${tableNumber} is reminding staff about their bill.`;
      targetRoles = settings?.routing?.billRequested || ["staff", "manager", "owner"];
    } else {
      return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 });
    }

    // Broadcast notification with sound
    for (const role of targetRoles) {
      await pusher.trigger(`private-${role}-${session.restaurantId}`, REALTIME_EVENTS.STAFF_NOTIFICATION, {
        message,
        isSilent: false, // User requested ringing for reminders
      });
    }

    return NextResponse.json({ message: "Reminder sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reminder error:", error);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}
