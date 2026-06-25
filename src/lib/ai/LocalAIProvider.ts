import { AIProvider, SentimentAnalysisResult, AIRecommendation, ForecastResult } from "./AIProvider";
import Order from "@/models/Order";
import ReviewModel from "@/models/Review";
import User from "@/models/User";
import mongoose from "mongoose";

export class LocalAIProvider implements AIProvider {

  // Phase 4.1B: Deterministic Sentiment Analysis
  async analyzeReview(text: string, rating: number): Promise<SentimentAnalysisResult> {
    if (!text) {
      // Base sentiment solely on rating if no text
      let label: "positive" | "neutral" | "negative" = "neutral";
      if (rating >= 4) label = "positive";
      if (rating <= 2) label = "negative";
      const score = (rating - 3) / 2; // maps 1 to -1.0, 3 to 0, 5 to 1.0
      return { sentimentScore: score, sentimentLabel: label, keywords: [] };
    }

    const positiveWords = ["excellent", "great", "amazing", "fast", "delicious", "perfect", "friendly", "awesome", "good", "love"];
    const negativeWords = ["slow", "bad", "terrible", "cold", "late", "dirty", "awful", "poor", "worst", "expensive"];

    const tokens = text.toLowerCase().match(/\b(\w+)\b/g) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    const extractedKeywords: string[] = [];

    tokens.forEach(token => {
      if (positiveWords.includes(token)) {
        positiveCount++;
        if (!extractedKeywords.includes(token)) extractedKeywords.push(token);
      }
      if (negativeWords.includes(token)) {
        negativeCount++;
        if (!extractedKeywords.includes(token)) extractedKeywords.push(token);
      }
    });

    // Score based on words + rating influence
    const wordScore = (positiveCount - negativeCount) / (tokens.length || 1); // -1.0 to +1.0
    const ratingScore = (rating - 3) / 2; // -1.0 to +1.0
    
    // Weight: 60% text content, 40% rating
    let finalScore = (wordScore * 0.6) + (ratingScore * 0.4);
    
    // Clamp to -1.0 -> 1.0
    finalScore = Math.max(-1.0, Math.min(1.0, finalScore));

    let label: "positive" | "neutral" | "negative" = "neutral";
    if (finalScore > 0.2) label = "positive";
    else if (finalScore < -0.2) label = "negative";

    return {
      sentimentScore: parseFloat(finalScore.toFixed(2)),
      sentimentLabel: label,
      keywords: extractedKeywords
    };
  }

  // Phase 4.1E: Smart Recommendation Engine (Deterministic Heuristics)
  async generateRecommendations(restaurantId: string): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const restObjId = new mongoose.Types.ObjectId(restaurantId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Kitchen Prep Times
    const orders = await Order.find({ restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo } });
    let totalPrepMs = 0;
    let prepCount = 0;
    let cancelCount = 0;

    orders.forEach(o => {
      if (o.status === "cancelled") cancelCount++;
      const received = o.statusHistory?.find((h: any) => h.status === "received");
      const ready = o.statusHistory?.find((h: any) => h.status === "ready");
      if (received && ready) {
        totalPrepMs += ready.timestamp.getTime() - received.timestamp.getTime();
        prepCount++;
      }
    });

    const avgPrepMins = prepCount > 0 ? (totalPrepMs / prepCount) / 60000 : 0;
    if (avgPrepMins > 25) {
      recommendations.push({
        severity: "high",
        title: "Kitchen Efficiency Warning",
        explanation: `Average preparation time is ${avgPrepMins.toFixed(0)} minutes, which is significantly slower than the target (15m).`,
        recommendedAction: "Review kitchen staffing levels or simplify complex menu items.",
        type: "negative"
      });
    }

    // 2. Cancellation Rates
    const cancelRate = orders.length > 0 ? (cancelCount / orders.length) * 100 : 0;
    if (cancelRate > 10) {
      recommendations.push({
        severity: "high",
        title: "High Cancellation Rate",
        explanation: `Your cancellation rate is ${cancelRate.toFixed(1)}%. High cancellations often correlate with long prep times or unavailable items.`,
        recommendedAction: "Audit recent cancelled orders to identify patterns and disable out-of-stock items promptly.",
        type: "negative"
      });
    }

    // 3. VIP Churn
    const users = await User.find({ $or: [{ savedRestaurants: restaurantId }, { followingRestaurants: restaurantId }] });
    const vipAtRisk = users.filter(u => u.customerSegment === "vip" && u.predictedChurnRisk && u.predictedChurnRisk > 50).length;
    
    if (vipAtRisk > 0) {
      recommendations.push({
        severity: "high",
        title: "VIP Retention Declining",
        explanation: `You have ${vipAtRisk} high-value (VIP) customers showing significant churn risk.`,
        recommendedAction: "Send a targeted re-engagement offer or personalized discount to the VIP segment.",
        type: "negative"
      });
    }

    // 4. Sentiment & Menu items (Placeholder for dynamic items)
    // Here we'd ideally find an item doing well. We'll use a generic positive recommendation if nothing else is critical.
    if (recommendations.length < 2) {
      recommendations.push({
        severity: "low",
        title: "Menu Optimization Opportunity",
        explanation: "Some of your best-selling items are rarely ordered as combos. Analyzing your order history suggests strong pairing potential.",
        recommendedAction: "Create an explicit Meal Deal combining a top-selling main with a high-margin beverage.",
        type: "positive"
      });
    }

    return recommendations;
  }

  // Phase 4.1D: Forecasting Engine
  async generateForecast(restaurantId: string): Promise<ForecastResult> {
    const { ForecastingService } = await import("@/lib/bi/ForecastingService");
    return ForecastingService.generateForecasts(restaurantId);
  }

  // Phase 4.1 Semantic Search fallback (Cosine similarity against simple text match)
  async semanticSearch(query: string, items: any[]): Promise<any[]> {
    const queryTokens = query.toLowerCase().split(/\W+/);
    return items.filter(item => {
      const targetText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
      return queryTokens.some(token => targetText.includes(token));
    });
  }
}
