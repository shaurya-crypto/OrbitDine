import Order from "@/models/Order";
import ForecastMetric from "@/models/ForecastMetric";
import mongoose from "mongoose";

export class ForecastingService {
  
  static async generateForecasts(restaurantId: string) {
    const restObjId = new mongoose.Types.ObjectId(restaurantId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Fetch historical data
    const dailyData = await Order.aggregate([
      { $match: { restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo }, status: "served" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, rev: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const hourlyData = await Order.aggregate([
      { $match: { restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo }, status: "served" } },
      { $group: { _id: { $hour: "$createdAt" }, orders: { $sum: 1 } } }
    ]);

    // Apply Linear Regression & Moving Average
    const revs = dailyData.map(d => d.rev);
    const cnts = dailyData.map(d => d.count);
    
    // Moving average fallback
    const avgRev = revs.length > 0 ? revs.reduce((a, b) => a + b, 0) / revs.length : 1000;
    const avgCnt = cnts.length > 0 ? cnts.reduce((a, b) => a + b, 0) / cnts.length : 15;

    // Linear regression slope
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const N = revs.length;
    
    for (let i = 0; i < N; i++) {
      sumX += i;
      sumY += revs[i];
      sumXY += (i * revs[i]);
      sumX2 += (i * i);
    }
    
    const slope = N > 1 ? (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX) : 0;
    
    // Predict next 7 days
    const next7DaysRevenue: number[] = [];
    const next7DaysOrders: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      const predictedRev = avgRev + (slope * i); // combining baseline with trend
      next7DaysRevenue.push(Math.round(predictedRev > 0 ? predictedRev : avgRev));
      next7DaysOrders.push(Math.round(avgCnt)); // Simplify order count for now
    }
    
    // Calculate Confidence Score
    const confidenceScore = Math.round(Math.min(95, Math.max(40, 40 + (N * 1.5)))); // more days = higher confidence

    // Predict Hourly Traffic
    const hourlyTraffic = new Array(24).fill(0);
    hourlyData.forEach(h => {
      if (h._id >= 0 && h._id < 24) {
        hourlyTraffic[h._id] = Math.round(h.orders / 30); // average orders for this hour over last 30 days
      }
    });

    // Save to ForecastMetric
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i + 1); // tomorrow onwards
      const dateString = targetDate.toISOString().split("T")[0];

      await ForecastMetric.findOneAndUpdate(
        { restaurantId: restObjId, date: dateString },
        {
          predictedRevenue: next7DaysRevenue[i],
          predictedOrders: next7DaysOrders[i],
          confidence: confidenceScore
        },
        { upsert: true }
      );
    }

    return {
      next7DaysRevenue,
      next7DaysOrders,
      next24HoursTraffic: hourlyTraffic,
      confidenceScore
    };
  }
}
