import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, sessionId, customerId, eventType, itemId, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newEvent = new AnalyticsEvent({
      restaurantId: restaurantId ? new mongoose.Types.ObjectId(restaurantId) : undefined,
      sessionId,
      customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      eventType,
      itemId: itemId ? new mongoose.Types.ObjectId(itemId) : undefined,
      metadata,
    });

    await newEvent.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
