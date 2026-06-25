import dbConnect from "@/lib/mongodb/db";
import Order from "@/models/Order";
import Bill from "@/models/Bill";
import Review from "@/models/Review";
import User from "@/models/User";
import DailyRestaurantMetric from "@/models/DailyRestaurantMetric";
import mongoose from "mongoose";

/**
 * MetricAggregationService runs nightly to populate DailyRestaurantMetric
 * materialized views for fast BI Dashboard querying.
 */
export async function generateDailyMetrics(restaurantId: string, targetDateStr: string) {
  await dbConnect();
  
  // Parse target date string (YYYY-MM-DD)
  const targetDate = new Date(targetDateStr);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // 1. Order Metrics
  const orders = await Order.find({
    restaurantId,
    createdAt: { $gte: targetDate, $lt: nextDate },
  });

  let totalOrders = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  let cancelledCount = 0;
  let totalPrepTimeMs = 0;
  let prepTimeOrders = 0;

  for (const order of orders) {
    totalOrders++;
    
    if (order.status === "cancelled") {
      cancelledCount++;
      continue;
    }
    
    totalRevenue += order.grandTotal || 0;
    
    // Profit margin calculation if cogs exists
    if (order.cogs) {
      totalProfit += ((order.grandTotal || 0) - order.cogs);
    } else if (order.profitMargin) {
      totalProfit += (order.grandTotal || 0) * (order.profitMargin / 100);
    }

    if (order.actualPrepTimeMs) {
      totalPrepTimeMs += order.actualPrepTimeMs;
      prepTimeOrders++;
    }
  }

  const avgOrderValue = totalOrders > cancelledCount ? totalRevenue / (totalOrders - cancelledCount) : 0;
  const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
  const averagePrepTimeMs = prepTimeOrders > 0 ? totalPrepTimeMs / prepTimeOrders : 0;

  // 2. Customer Metrics
  const bills = await Bill.find({
    restaurantId,
    createdAt: { $gte: targetDate, $lt: nextDate },
    status: "paid"
  });

  const uniqueCustomers = new Set<string>();
  bills.forEach(b => {
    if (b.customerId) uniqueCustomers.add(b.customerId.toString());
  });

  let newCustomers = 0;
  let repeatCustomers = 0;

  // Verify new vs repeat (simplified logic: if user created today, new. else repeat)
  for (const customerId of uniqueCustomers) {
    const user = await User.findById(customerId);
    if (user) {
      if (user.createdAt >= targetDate && user.createdAt < nextDate) {
        newCustomers++;
      } else {
        repeatCustomers++;
      }
    }
  }

  // 3. Review Metrics
  const reviews = await Review.find({
    restaurantId,
    createdAt: { $gte: targetDate, $lt: nextDate }
  });

  const reviewCount = reviews.length;
  let totalRating = 0;
  let totalSentiment = 0;
  
  reviews.forEach(r => {
    totalRating += r.rating || 0;
    totalSentiment += r.sentimentScore || 0;
  });

  const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
  const averageSentiment = reviewCount > 0 ? totalSentiment / reviewCount : 0;

  // 4. Upsert Metric Document
  await DailyRestaurantMetric.findOneAndUpdate(
    { restaurantId, date: targetDateStr },
    {
      $set: {
        orders: totalOrders,
        revenue: totalRevenue,
        profit: totalProfit,
        avgOrderValue,
        cancellationRate,
        customers: uniqueCustomers.size,
        newCustomers,
        repeatCustomers,
        reviewCount,
        averageRating,
        sentimentScore: averageSentiment,
        averagePrepTimeMs
      }
    },
    { upsert: true, new: true }
  );

  return { success: true, date: targetDateStr, orders: totalOrders };
}
