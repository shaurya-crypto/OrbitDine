import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
  try {
    const { restaurantId, message, senderRole } = await req.json();

    if (!restaurantId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pusher = pusherServer;
    const roles = ["owner", "manager", "staff", "kitchen"];

    // Broadcast to all roles
    for (const role of roles) {
      await pusher.trigger(`private-${role}-${restaurantId}`, "CUSTOM_ALERT", {
        message: `${senderRole.toUpperCase()}: ${message}`
      });
    }

    return NextResponse.json({ message: "Broadcast sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Custom notification error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
