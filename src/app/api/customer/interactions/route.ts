import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { action, type, id } = body;
    // action: "toggle"
    // type: "favorite_restaurant" | "favorite_item" | "follow_restaurant"
    // id: the ID of the restaurant or menu item

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (type === "favorite_restaurant") {
      const idx = user.savedRestaurants.indexOf(id);
      if (idx > -1) {
        user.savedRestaurants.splice(idx, 1);
      } else {
        user.savedRestaurants.push(id);
      }
      await user.save();
      return NextResponse.json({ success: true, savedRestaurants: user.savedRestaurants });
    }

    if (type === "favorite_item") {
      const idx = user.favoriteItems.indexOf(id);
      if (idx > -1) {
        user.favoriteItems.splice(idx, 1);
      } else {
        user.favoriteItems.push(id);
      }
      await user.save();
      return NextResponse.json({ success: true, favoriteItems: user.favoriteItems });
    }

    if (type === "follow_restaurant") {
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

      const idx = user.followingRestaurants.indexOf(id);
      let isFollowing = false;
      if (idx > -1) {
        // Unfollow
        user.followingRestaurants.splice(idx, 1);
        restaurant.followerCount = Math.max(0, restaurant.followerCount - 1);
      } else {
        // Follow
        user.followingRestaurants.push(id);
        restaurant.followerCount += 1;
        isFollowing = true;
      }
      
      await Promise.all([user.save(), restaurant.save()]);
      return NextResponse.json({ success: true, followingRestaurants: user.followingRestaurants, isFollowing, followerCount: restaurant.followerCount });
    }

    return NextResponse.json({ error: "Invalid action or type" }, { status: 400 });

  } catch (error: any) {
    console.error("Interaction API Error:", error);
    return NextResponse.json({ error: "Interaction failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await User.findById(decoded.userId)
      .populate("savedRestaurants", "name slug logo cuisineType rating reviewCount")
      .populate("followingRestaurants", "name slug logo cuisineType rating reviewCount")
      .populate({
        path: "favoriteItems",
        select: "name price image veg description restaurantId",
        populate: { path: "restaurantId", select: "name slug" }
      });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        savedRestaurants: user.savedRestaurants,
        followingRestaurants: user.followingRestaurants,
        favoriteItems: user.favoriteItems
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
