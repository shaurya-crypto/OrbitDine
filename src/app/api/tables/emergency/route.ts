import { NextRequest, NextResponse } from "next/server";
import { eventBus } from "@/lib/services/eventBus";

export async function POST(req: NextRequest) {
  try {
    const { tableId, restaurantId } = await req.json();

    if (!tableId || !restaurantId) {
      return NextResponse.json({ message: "tableId and restaurantId are required" }, { status: 400 });
    }

    await eventBus.emitEmergency({
      tableId,
      restaurantId,
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Emergency alert sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Emergency Alert Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
