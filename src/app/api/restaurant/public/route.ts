import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    await connectToDatabase();

    const restaurant = await Restaurant.findById(restaurantId).select("name logo bannerImage address city cuisineType rating status");

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error) {
    console.error("Public Restaurant GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
