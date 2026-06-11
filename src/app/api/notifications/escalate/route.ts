import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
  try {
    const { restaurantId, level, originalMessage, originalTitle } = await req.json();

    if (!restaurantId || !level) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const pusher = pusherServer;
    
    // Level 1: Escalate to manager
    // Level 2: Escalate to owner
    const targetRoles = level === 1 ? ["manager"] : ["owner"];
    
    for (const role of targetRoles) {
      await pusher.trigger(`private-${role}-${restaurantId}`, "TABLE_EMERGENCY", {
        tableId: "ESCALATED",
        message: `ESCALATION (${level === 1 ? '20m' : '30m'} Unanswered): ${originalTitle} - ${originalMessage}`
      });
    }

    return NextResponse.json({ message: "Escalated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: "Failed to escalate" }, { status: 500 });
  }
}
