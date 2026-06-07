import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "25") * 1000; // Convert km to meters
    const query = searchParams.get("query") || "";
    const city = searchParams.get("city") || "";

    const hasCoordinates = lat !== 0 && lng !== 0;

    let matchStage: any = { status: "active" };

    if (query) {
      matchStage.$text = { $search: query };
    }

    if (!hasCoordinates && city) {
      // Fallback: If no GPS, search by city
      matchStage.city = { $regex: new RegExp(city, "i") };
    }

    let pipeline: any[] = [];

    // If we have GPS coordinates, we MUST start with $geoNear
    if (hasCoordinates) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "calculatedDistance",
          maxDistance: radius,
          spherical: true,
          query: matchStage, // $geoNear accepts a query to filter documents
        },
      });
    } else {
      // If no GPS, just do a normal $match
      pipeline.push({ $match: matchStage });
    }

    // Add logic to check if Open/Closed
    // We can do this in JS after fetching, or via complex aggregation. Doing it in JS is easier for now.
    
    // Add logic for Weighted Ranking
    // We will calculate a "score"
    // Score = (Rating * 20) + (log(ReviewCount) * 10) - (DistanceInKm * 2)
    pipeline.push({
      $addFields: {
        distanceKm: { $divide: ["$calculatedDistance", 1000] },
      }
    });

    // Execute aggregation
    const results = await Restaurant.aggregate(pipeline);

    // Post-process: Add isOpen flag and sort by score
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour + currentMin / 60;

    const processedResults = results.map((r: any) => {
      let isOpen = true;
      if (r.openingHours && r.closingHours) {
        const parseTime = (t: string) => {
          const [h, m] = t.split(":").map(Number);
          return h + m / 60;
        };
        const open = parseTime(r.openingHours);
        const close = parseTime(r.closingHours);
        
        if (close < open) {
          // Crosses midnight
          isOpen = currentTime >= open || currentTime <= close;
        } else {
          isOpen = currentTime >= open && currentTime <= close;
        }
      }

      // Calculate weighted score
      const distancePenalty = r.distanceKm ? r.distanceKm * 2 : 50; // Penalty of 50 if no distance
      const ratingBonus = (r.rating || 0) * 20;
      const reviewBonus = Math.log10(Math.max(r.reviewCount || 1, 1)) * 10;
      const queryRelevance = r.score || 0; // If text search was used

      // Add a huge bonus if it matches text search
      const textBonus = query ? queryRelevance * 50 : 0;

      r.score = ratingBonus + reviewBonus - distancePenalty + textBonus;
      r.isOpen = isOpen;

      return r;
    });

    // Sort by score descending
    processedResults.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      data: processedResults,
    });
  } catch (error: any) {
    console.error("Nearby discovery error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
