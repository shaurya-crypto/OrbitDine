import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import ReviewModel from "@/models/Review";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { restaurantId, sessionId, customerId, orderId, rating, foodRating, serviceRating, ambienceRating, feedback } = body;
    
    if (!restaurantId || typeof rating !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }
    
    // Calculate new rating
    const currentRating = restaurant.rating || 0;
    const currentCount = restaurant.reviewCount || 0;
    
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;
    
    restaurant.rating = Number(newRating.toFixed(1));
    restaurant.reviewCount = newCount;
    
    await restaurant.save();
    
    // Save the detailed review text
    await ReviewModel.create({
      restaurantId,
      sessionId,
      customerId,
      orderId,
      rating,
      foodRating,
      serviceRating,
      ambienceRating,
      feedback: feedback ? feedback.trim() : "",
    });
    
    return NextResponse.json({ message: "Rating submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Rate Restaurant API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
