import { NextResponse } from "next/server";
import { eventBus } from "@/lib/services/eventBus";

export async function POST(req: Request) {
  try {
    const { restaurantId } = await req.json();

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    await eventBus.emitStopSounds(restaurantId, "Alarm stopped by a team member");

    return NextResponse.json({ message: "Sounds stopped successfully" }, { status: 200 });
  } catch (error) {
    console.error("Stop sound error:", error);
    return NextResponse.json({ error: "Failed to stop sounds" }, { status: 500 });
  }
}
