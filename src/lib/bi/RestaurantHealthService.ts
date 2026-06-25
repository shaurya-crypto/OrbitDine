import DailyRestaurantMetric from "@/models/DailyRestaurantMetric";
import mongoose from "mongoose";

export interface HealthScoreResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  breakdown: {
    revenueHealth: number;
    customerHealth: number;
    operationalHealth: number;
    reviewHealth: number;
  };
  insights: { message: string; type: "positive" | "negative" | "neutral" }[];
}

export async function calculateRestaurantHealth(restaurantId: string): Promise<HealthScoreResult> {
  const restObjId = new mongoose.Types.ObjectId(restaurantId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Use raw models instead of DailyRestaurantMetric to ensure real-time accuracy for Phase 4.1
  const orders = await mongoose.models.Order.find({ restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo } });
  const reviews = await mongoose.models.Review.find({ restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo } });

  // 1. Revenue & Operations
  let currentRev = 0, currentCancels = 0, currentPrepMs = 0, prepCount = 0;
  orders.forEach((o: any) => {
    currentRev += o.grandTotal || 0;
    if (o.status === "cancelled") currentCancels++;
    const received = o.statusHistory?.find((h: any) => h.status === "received");
    const ready = o.statusHistory?.find((h: any) => h.status === "ready");
    if (received && ready) {
      currentPrepMs += ready.timestamp.getTime() - received.timestamp.getTime();
      prepCount++;
    }
  });

  const cancelRate = orders.length > 0 ? (currentCancels / orders.length) * 100 : 0;
  const avgPrepMins = prepCount > 0 ? (currentPrepMs / prepCount) / 60000 : 15;

  // 2. Sentiment
  let totalSentiment = 0, sentimentCount = 0;
  reviews.forEach((r: any) => {
    if (r.sentimentScore !== undefined) {
      totalSentiment += r.sentimentScore;
      sentimentCount++;
    } else if (r.rating) {
      totalSentiment += (r.rating - 3) / 2; // approximation if missing
      sentimentCount++;
    }
  });
  const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0.5; // Default slightly positive

  // Scoring out of 100
  let score = 100;
  
  // Penalties
  if (cancelRate > 2) score -= (cancelRate - 2) * 2;
  if (avgPrepMins > 15) score -= (avgPrepMins - 15) * 1.5;
  if (avgSentiment < 0.2) score -= 15;
  if (avgSentiment < 0) score -= 10;
  if (orders.length === 0) score -= 20;

  // Floor and Ceil
  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade: "A+" | "A" | "B" | "C" | "D" = "D";
  if (score >= 95) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 50) grade = "C";

  // Generate Explicit Insights
  const insights: { message: string; type: "positive" | "negative" | "neutral" }[] = [];
  
  if (cancelRate > 5) {
    insights.push({ message: `Cancellation rate is elevated at ${cancelRate.toFixed(1)}%. Check stock and staffing.`, type: "negative" });
  } else if (cancelRate < 2 && orders.length > 0) {
    insights.push({ message: `Excellent fulfillment rate! Cancellations are under 2%.`, type: "positive" });
  }

  if (avgPrepMins > 25) {
    insights.push({ message: `Average prep time (${avgPrepMins.toFixed(0)}m) is hurting your operational score.`, type: "negative" });
  } else if (avgPrepMins < 15 && prepCount > 0) {
    insights.push({ message: `Kitchen is operating highly efficiently (${avgPrepMins.toFixed(0)}m avg prep).`, type: "positive" });
  }

  if (avgSentiment > 0.5) {
    insights.push({ message: `Customer sentiment is extremely positive! Keep it up.`, type: "positive" });
  } else if (avgSentiment < 0) {
    insights.push({ message: `Recent reviews indicate negative sentiment. Review feedback carefully.`, type: "negative" });
  }

  if (insights.length === 0) {
    insights.push({ message: "Operations are stable. Focus on growth and marketing.", type: "neutral" });
  }

  return {
    score,
    grade,
    breakdown: {
      revenueHealth: 25,
      customerHealth: 25,
      operationalHealth: 25,
      reviewHealth: 25,
    },
    insights
  };
}
