import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import "@/models/User"; // Ensure schema is registered for populate

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "fullName email")
      .lean();

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
