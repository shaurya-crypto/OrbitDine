import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Auth check
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const userId = payload.userId;
    
    const { restaurantId } = await req.json();
    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isSaved = user.savedRestaurants.includes(restaurantId);

    if (isSaved) {
      await User.findByIdAndUpdate(userId, {
        $pull: { savedRestaurants: restaurantId }
      });
      return NextResponse.json({ message: "Removed from favorites", action: "removed" });
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedRestaurants: restaurantId }
      });
      return NextResponse.json({ message: "Added to favorites", action: "added" });
    }

  } catch (error) {
    console.error("Favorites API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
