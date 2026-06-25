import User from "@/models/User";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function calculateCustomerChurnRisks(restaurantId: string) {
  // Find all customers who have ordered from this restaurant
  // For simplicity, we query users who have the restaurant in saved/following or we aggregate from orders
  const orders = await Order.find({ restaurantId }).select("servedBy createdAt grandTotal");
  
  const customerMap = new Map<string, { lastOrder: Date; orderCount: number; totalSpent: number }>();
  
  for (const order of orders) {
    if (order.servedBy) { // Assuming servedBy or a customerId is here. Wait, Order has sessionId, Bill has customerId.
      // Let's use a broader approach: Update all users connected to this restaurant
    }
  }

  // To be accurate, we'll fetch Users who have this restaurant in their history
  const customers = await User.find({
    $or: [
      { savedRestaurants: restaurantId },
      { followingRestaurants: restaurantId }
    ]
  });

  const now = new Date();

  for (const customer of customers) {
    let riskScore = 0;
    
    // 1. Recency
    if (customer.lastOrderDate) {
      const daysSinceLastOrder = (now.getTime() - customer.lastOrderDate.getTime()) / (1000 * 3600 * 24);
      if (daysSinceLastOrder > 90) riskScore += 50;
      else if (daysSinceLastOrder > 60) riskScore += 30;
      else if (daysSinceLastOrder > 30) riskScore += 10;
    } else {
      riskScore += 50; // No orders yet or inactive
    }

    // 2. Frequency
    if (customer.visitFrequency !== undefined) {
      if (customer.visitFrequency < 2) riskScore += 20;
    }

    // 3. Monetary
    if (customer.totalSpent !== undefined) {
      if (customer.totalSpent < 50) riskScore += 10;
    }

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    // Segmentation
    let segment = "new_customer";
    if (riskScore > 75) segment = "inactive";
    else if (riskScore > 50) segment = "churn_risk";
    else if (customer.totalOrders > 10 && customer.totalSpent > 500) segment = "vip";
    else if (customer.totalOrders > 5) segment = "loyal";
    else if (customer.totalOrders > 1) segment = "regular";

    customer.predictedChurnRisk = riskScore;
    customer.customerSegment = segment;
    
    await customer.save();
  }
  
  return { updatedCount: customers.length };
}
