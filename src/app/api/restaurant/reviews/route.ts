import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import ReviewModel from "@/models/Review";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    await connectToDatabase();

    const reviews = await ReviewModel.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
