import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import { calculateCustomerChurnRisks } from "@/lib/bi/CustomerChurnService";
import { AIFactory } from "@/lib/ai/AIFactory";
import { generateDailyMetrics } from "@/lib/bi/MetricAggregationService";
import { MenuIntelligenceService } from "@/lib/bi/MenuIntelligenceService";
import { calculateRestaurantHealth } from "@/lib/bi/RestaurantHealthService";
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

    // Yesterday's date for daily metrics
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const results: Record<string, any> = {};

    for (const restaurant of restaurants) {
      const restIdStr = restaurant._id.toString();
      const restResults: Record<string, string> = {};

      try {
        // 1. Daily Metrics Aggregation (was previously DEAD — never called)
        await generateDailyMetrics(restIdStr, yesterdayStr);
        restResults.dailyMetrics = "ok";
      } catch (e) {
        console.error(`DailyMetrics failed for ${restIdStr}:`, e);
        restResults.dailyMetrics = "failed";
      }

      try {
        // 2. Calculate RFM Churn Risks & Segments
        await calculateCustomerChurnRisks(restIdStr);
        restResults.churnRisks = "ok";
      } catch (e) {
        console.error(`ChurnRisks failed for ${restIdStr}:`, e);
        restResults.churnRisks = "failed";
      }

      try {
        // 3. Generate and Store Forecast Data
        const forecast = await aiProvider.generateForecast(restIdStr);
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        const dateString = targetDate.toISOString().split("T")[0];

        await ForecastMetric.findOneAndUpdate(
          { restaurantId: restaurant._id, date: dateString },
          {
            predictedRevenue: forecast.next7DaysRevenue[0],
            predictedOrders: forecast.next7DaysOrders[0],
            confidence: forecast.confidenceScore
          },
          { upsert: true }
        );
        restResults.forecast = "ok";
      } catch (e) {
        console.error(`Forecast failed for ${restIdStr}:`, e);
        restResults.forecast = "failed";
      }

      try {
        // 4. Menu Intelligence (was previously NEVER triggered from cron)
        await MenuIntelligenceService.calculatePopularityScores(restIdStr);
        restResults.menuIntel = "ok";
      } catch (e) {
        console.error(`MenuIntel failed for ${restIdStr}:`, e);
        restResults.menuIntel = "failed";
      }

      try {
        // 5. Restaurant Health (pre-compute for dashboards)
        await calculateRestaurantHealth(restIdStr);
        restResults.health = "ok";
      } catch (e) {
        console.error(`Health failed for ${restIdStr}:`, e);
        restResults.health = "failed";
      }

      results[restIdStr] = restResults;
    }

    return NextResponse.json({ 
      message: "Nightly BI routines completed successfully",
      restaurantsProcessed: restaurants.length,
      results
    }, { status: 200 });
  } catch (error) {
    console.error("Nightly BI Cron Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

