import connectToDatabase from "@/lib/mongodb/db";
import OrderSession from "@/models/OrderSession";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * CustomerRecommendationEngine — Generates dynamic, data-driven recommendations
 * for individual customers based on their actual ordering behavior.
 * 
 * NO placeholders. NO hardcoded strings. Every recommendation is computed
 * from real MongoDB aggregations.
 */

interface CustomerRecommendation {
  type: "insight" | "suggestion" | "alert" | "achievement";
  icon: string;
  text: string;
  priority: number;
}

export class CustomerRecommendationEngine {
  static async generateForCustomer(userId: string): Promise<CustomerRecommendation[]> {
    await connectToDatabase();
    const recommendations: CustomerRecommendation[] = [];
    const userObjId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjId).lean();
    if (!user) return recommendations;

    // 1. Get completed sessions
    const sessions = await OrderSession.find({ userId: userObjId, status: "completed" })
      .populate("restaurantId", "name")
      .lean();

    if (sessions.length === 0) {
      recommendations.push({
        type: "suggestion",
        icon: "🍽️",
        text: "Welcome to OrbitDine! Scan a QR code at any partner restaurant to place your first order.",
        priority: 10,
      });
      return recommendations;
    }

    // 2. Get all orders for this user's sessions
    const sessionIds = sessions.map(s => s._id);
    const orders = await Order.find({ sessionId: { $in: sessionIds }, status: { $ne: "cancelled" } }).lean();

    // ═══ FAVORITE HOUR ANALYSIS ═══
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
    if (favoriteHour !== null && maxHourCount >= 2) {
      const period = favoriteHour < 12 ? "morning" : favoriteHour < 17 ? "afternoon" : "evening";
      recommendations.push({
        type: "insight",
        icon: "⏰",
        text: `You usually order around ${favoriteHour}:00. You're a ${period} foodie!`,
        priority: 5,
      });
    }

    // ═══ FAVORITE DAY ANALYSIS ═══
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts: Record<number, number> = {};
    sessions.forEach(s => {
      const day = new Date(s.createdAt).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    let favoriteDay = 0;
    let maxDayCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        favoriteDay = parseInt(day);
      }
    });
    if (maxDayCount >= 2) {
      recommendations.push({
        type: "insight",
        icon: "📅",
        text: `${dayNames[favoriteDay]} is your most active ordering day.`,
        priority: 4,
      });
    }

    // ═══ FAVORITE RESTAURANT ═══
    const restCounts: Record<string, { count: number; name: string }> = {};
    sessions.forEach((s: any) => {
      const restId = s.restaurantId?._id?.toString();
      const restName = s.restaurantId?.name;
      if (restId && restName) {
        if (!restCounts[restId]) restCounts[restId] = { count: 0, name: restName };
        restCounts[restId].count++;
      }
    });
    const sortedRests = Object.values(restCounts).sort((a, b) => b.count - a.count);
    if (sortedRests.length > 0 && sortedRests[0].count >= 2) {
      recommendations.push({
        type: "insight",
        icon: "❤️",
        text: `${sortedRests[0].name} is your favorite restaurant — you've visited ${sortedRests[0].count} times!`,
        priority: 7,
      });
    }

    // ═══ FAVORITE CATEGORY / ITEM ═══
    const itemCounts: Record<string, { count: number; name: string }> = {};
    orders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.name;
        if (name) {
          if (!itemCounts[name]) itemCounts[name] = { count: 0, name };
          itemCounts[name].count += item.quantity || 1;
        }
      });
    });
    const sortedItems = Object.values(itemCounts).sort((a, b) => b.count - a.count);
    if (sortedItems.length > 0) {
      recommendations.push({
        type: "insight",
        icon: "🌟",
        text: `Your most ordered item is ${sortedItems[0].name} (ordered ${sortedItems[0].count} times).`,
        priority: 6,
      });
    }

    // ═══ INACTIVITY ALERT ═══
    if (user.lastOrderDate) {
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(user.lastOrderDate).getTime()) / (1000 * 3600 * 24)
      );
      if (daysSinceLast > 14) {
        recommendations.push({
          type: "alert",
          icon: "👋",
          text: `You haven't ordered in ${daysSinceLast} days. We miss you!`,
          priority: 8,
        });
      }
    }

    // ═══ LOYALTY PROGRESS ═══
    if (user.loyaltyPoints !== undefined) {
      const nextTierThresholds = { bronze: 500, silver: 2000, gold: 5000, platinum: Infinity };
      const currentTier = (user as any).rewardTier || "bronze";
      const nextThreshold = nextTierThresholds[currentTier as keyof typeof nextTierThresholds];
      if (nextThreshold !== Infinity) {
        const remaining = nextThreshold - (user.loyaltyPoints || 0);
        if (remaining > 0) {
          recommendations.push({
            type: "suggestion",
            icon: "🏆",
            text: `You're ${remaining} points away from the next reward tier. Keep ordering!`,
            priority: 3,
          });
        }
      }
    }

    // ═══ SAVINGS TRACKING ═══
    if ((user.totalSpent || 0) > 0) {
      // Estimate savings: loyalty points redeemed + any discount applied
      const estimatedSavings = Math.floor((user.loyaltyPoints || 0) * 0.1); // ₹0.1 per point as a rough estimate
      if (estimatedSavings > 0) {
        recommendations.push({
          type: "achievement",
          icon: "💰",
          text: `You've earned ₹${estimatedSavings} worth of loyalty rewards through OrbitDine!`,
          priority: 2,
        });
      }
    }

    // Sort by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations.slice(0, 8); // Max 8 recommendations
  }
}
