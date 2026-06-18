import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Review from "@/models/Review";
import Restaurant from "@/models/Restaurant";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");
    const customerId = url.searchParams.get("customerId");
    const moderationStatus = url.searchParams.get("moderationStatus");

    let query: any = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (customerId) query.customerId = customerId;
    if (moderationStatus) query.moderationStatus = moderationStatus;

    const reviews = await Review.find(query)
      .populate("customerId", "fullName profileImage isVerified")
      .populate("restaurantId", "name logo slug")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { reviewId, restaurantReply, moderationStatus, flagged, flaggedReason, helpfulVote } = body;

    const review = await Review.findById(reviewId);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Customer helpful vote
    if (helpfulVote && decoded.roles.includes("customer")) {
      review.helpfulVotes += 1;
      await review.save();
      return NextResponse.json({ success: true, helpfulVotes: review.helpfulVotes });
    }

    // Owner replying
    if (restaurantReply !== undefined && (decoded.roles.includes("owner") || decoded.roles.includes("manager"))) {
      const restaurant = await Restaurant.findById(review.restaurantId);
      if (restaurant?.ownerId.toString() !== decoded.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      review.restaurantReply = restaurantReply;
      review.restaurantRepliedAt = new Date();
      await review.save();
      return NextResponse.json({ success: true, review });
    }

    // Admin moderation
    if ((moderationStatus || flagged !== undefined) && decoded.roles.includes("superadmin")) {
      if (moderationStatus) review.moderationStatus = moderationStatus;
      if (flagged !== undefined) review.flagged = flagged;
      if (flaggedReason) review.flaggedReason = flaggedReason;
      
      // Basic Audit log output to console for now, actual DB log would go here.
      console.log(`AUDIT [Admin ${decoded.userId}]: Modified review ${reviewId} - status: ${moderationStatus}`);
      
      await review.save();
      return NextResponse.json({ success: true, review });
    }

    return NextResponse.json({ error: "No valid action performed or missing permissions" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
