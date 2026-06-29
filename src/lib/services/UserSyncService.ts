import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import OrderSession from "@/models/OrderSession";
import Bill from "@/models/Bill";
import Order from "@/models/Order";
import mongoose from "mongoose";

/**
 * UserSyncService — Recalculates ALL customer metrics from source-of-truth (orders/bills).
 * Called after every session close. Never uses incremental counters — always re-aggregates.
 */

// Achievement definitions
const ACHIEVEMENT_RULES: { id: string; label: string; check: (stats: UserStats) => boolean }[] = [
  { id: "first_order", label: "First Order 🎉", check: (s) => s.totalOrders >= 1 },
  { id: "ten_orders", label: "10 Orders 🔥", check: (s) => s.totalOrders >= 10 },
  { id: "fifty_orders", label: "50 Orders 💎", check: (s) => s.totalOrders >= 50 },
  { id: "food_explorer", label: "Food Explorer 🌍", check: (s) => s.uniqueRestaurants >= 5 },
  { id: "loyal_customer", label: "Loyal Customer ❤️", check: (s) => s.totalOrders >= 20 },
  { id: "big_spender", label: "Big Spender 💰", check: (s) => s.totalSpent >= 10000 },
  { id: "weekend_foodie", label: "Weekend Foodie 🍕", check: (s) => s.weekendOrderRatio > 0.5 },
  { id: "early_bird", label: "Early Bird 🌅", check: (s) => s.favoriteHour !== null && s.favoriteHour < 12 },
  { id: "night_owl", label: "Night Owl 🦉", check: (s) => s.favoriteHour !== null && s.favoriteHour >= 21 },
  { id: "vip", label: "VIP Customer 👑", check: (s) => s.totalOrders >= 30 && s.totalSpent >= 15000 },
];

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  visitFrequency: number;
  lifetimeValue: number;
  uniqueRestaurants: number;
  weekendOrderRatio: number;
  favoriteHour: number | null;
  loyaltyPoints: number;
  rewardTier: string;
  customerSegment: string;
  predictedChurnRisk: number;
  achievements: string[];
}

function calculateRewardTier(points: number): string {
  if (points >= 5000) return "platinum";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

function calculateSegment(totalOrders: number, totalSpent: number, daysSinceLastOrder: number): string {
  if (daysSinceLastOrder > 90) return "inactive";
  if (daysSinceLastOrder > 60) return "churn_risk";
  if (totalOrders >= 20 && totalSpent >= 5000) return "vip";
  if (totalOrders >= 10) return "loyal";
  if (totalOrders >= 3) return "regular";
  if (totalOrders >= 1) return "new_customer";
  return "new_customer";
}

function calculateChurnRisk(daysSinceLastOrder: number, visitFrequency: number): number {
  let risk = 0;
  if (daysSinceLastOrder > 90) risk += 50;
  else if (daysSinceLastOrder > 60) risk += 35;
  else if (daysSinceLastOrder > 30) risk += 15;
  else if (daysSinceLastOrder > 14) risk += 5;

  if (visitFrequency < 1) risk += 25;
  else if (visitFrequency < 2) risk += 10;

  return Math.min(100, Math.max(0, risk));
}

export async function syncAfterSessionClose(userId: string | mongoose.Types.ObjectId) {
  await connectToDatabase();

  const userObjId = new mongoose.Types.ObjectId(userId.toString());

  // 1. Aggregate all completed sessions for this user
  const sessions = await OrderSession.find({ userId: userObjId, status: "completed" }).lean();
  const sessionIds = sessions.map(s => s._id);

  // 2. Get all bills for these sessions
  const bills = await Bill.find({ sessionId: { $in: sessionIds } }).lean();

  // 3. Calculate core metrics
  const totalOrders = sessions.length;
  let totalSpent = 0;
  bills.forEach((b: any) => {
    totalSpent += b.grandTotal || 0;
  });
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // 4. Last order date
  const sortedSessions = sessions
    .filter(s => s.endedAt)
    .sort((a: any, b: any) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
  const lastOrderDate = sortedSessions.length > 0 ? new Date(sortedSessions[0].endedAt as any) : null;

  // 5. Visit frequency (orders per month since first order)
  const firstSession = sessions
    .filter(s => s.createdAt)
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  
  let visitFrequency = 0;
  if (firstSession && totalOrders > 0) {
    const monthsSinceFirst = Math.max(1, (Date.now() - new Date(firstSession.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
    visitFrequency = parseFloat((totalOrders / monthsSinceFirst).toFixed(1));
  }

  // 6. Unique restaurants visited
  const uniqueRestaurants = new Set(sessions.map((s: any) => s.restaurantId?.toString()).filter(Boolean)).size;

  // 7. Weekend order ratio
  let weekendOrders = 0;
  sessions.forEach(s => {
    const day = new Date(s.createdAt).getDay();
    if (day === 0 || day === 6) weekendOrders++;
  });
  const weekendOrderRatio = totalOrders > 0 ? weekendOrders / totalOrders : 0;

  // 8. Favorite ordering hour
  const hourCounts: Record<number, number> = {};
  sessions.forEach(s => {
    const hour = new Date(s.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  let favoriteHour: number | null = null;
  let maxHourCount = 0;
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      favoriteHour = parseInt(hour);
    }
  });

  // 9. Loyalty points: 1 point per ₹10 spent
  const loyaltyPoints = Math.floor(totalSpent / 10);
  const rewardTier = calculateRewardTier(loyaltyPoints);

  // 10. Segmentation & Churn
  const daysSinceLastOrder = lastOrderDate
    ? (Date.now() - lastOrderDate.getTime()) / (1000 * 3600 * 24)
    : 999;
  const customerSegment = calculateSegment(totalOrders, totalSpent, daysSinceLastOrder);
  const predictedChurnRisk = calculateChurnRisk(daysSinceLastOrder, visitFrequency);

  // 11. Achievements
  const stats: UserStats = {
    totalOrders, totalSpent, averageOrderValue, lastOrderDate,
    visitFrequency, lifetimeValue: totalSpent, uniqueRestaurants,
    weekendOrderRatio, favoriteHour, loyaltyPoints, rewardTier,
    customerSegment, predictedChurnRisk, achievements: [],
  };

  const unlockedAchievements = ACHIEVEMENT_RULES
    .filter(rule => rule.check(stats))
    .map(rule => rule.id);

  // 12. Atomic update
  await User.findByIdAndUpdate(userObjId, {
    $set: {
      totalOrders,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      lastOrderDate,
      visitFrequency,
      lifetimeValue: parseFloat(totalSpent.toFixed(2)),
      loyaltyPoints,
      rewardTier,
      customerSegment,
      predictedChurnRisk,
      achievements: unlockedAchievements,
    },
  });

  return stats;
}
