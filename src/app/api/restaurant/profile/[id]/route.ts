import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const restaurant = await Restaurant.findById(id).select(
      "name slug logo description cuisineType address city state country pinCode phone email openingHours closingHours rating reviewCount averagePrice"
    );

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Fetch restaurant profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
