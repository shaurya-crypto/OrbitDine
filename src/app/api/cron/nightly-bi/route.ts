import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import { calculateCustomerChurnRisks } from "@/lib/bi/CustomerChurnService";
import { AIFactory } from "@/lib/ai/AIFactory";
import Restaurant from "@/models/Restaurant";
import ForecastMetric from "@/models/ForecastMetric";

// This endpoint is meant to be called daily by Vercel Cron
// Set up in vercel.json:
// { "crons": [{ "path": "/api/cron/nightly-bi", "schedule": "0 2 * * *" }] }

export async function GET(req: NextRequest) {
  // Protect cron endpoint (Vercel sets CRON_SECRET)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const restaurants = await Restaurant.find({}, "_id");
    const aiProvider = AIFactory.getProvider();

    for (const restaurant of restaurants) {
      const restIdStr = restaurant._id.toString();

      // 1. Calculate RFM Churn Risks & Segments
      await calculateCustomerChurnRisks(restIdStr);

      // 2. Generate and Store Forecast Data
      const forecast = await aiProvider.generateForecast(restIdStr);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1); // Predict for "tomorrow"
      const dateString = targetDate.toISOString().split("T")[0];

      await ForecastMetric.findOneAndUpdate(
        { restaurantId: restaurant._id, date: dateString },
        {
          predictedRevenue: forecast.next7DaysRevenue[0], // Using the immediate next day
          predictedOrders: forecast.next7DaysOrders[0],
          confidence: forecast.confidenceScore
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ message: "Nightly BI routines completed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Nightly BI Cron Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
