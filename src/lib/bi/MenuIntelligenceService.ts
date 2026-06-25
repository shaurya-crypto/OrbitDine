import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import mongoose from "mongoose";

export class MenuIntelligenceService {
  static async calculatePopularityScores(restaurantId: string) {
    const restObjId = new mongoose.Types.ObjectId(restaurantId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const items = await MenuItem.find({ restaurantId: restObjId });
    const orders = await Order.find({ restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo } });
    const events = await AnalyticsEvent.find({ restaurantId: restObjId, createdAt: { $gte: thirtyDaysAgo } });

    // Build stats map
    const statsMap: Record<string, { orders: number; revenue: number; views: number; clicks: number; cartAdds: number }> = {};
    
    items.forEach(item => {
      statsMap[item._id.toString()] = { orders: 0, revenue: 0, views: 0, clicks: 0, cartAdds: 0 };
    });

    // Process Orders
    orders.forEach(o => {
      o.cart?.items?.forEach((cartItem: any) => {
        const iId = cartItem.menuItemId.toString();
        if (statsMap[iId]) {
          statsMap[iId].orders += cartItem.quantity || 1;
          statsMap[iId].revenue += (cartItem.price * (cartItem.quantity || 1));
        }
      });
    });

    // Process Events
    events.forEach(e => {
      if (e.targetId && statsMap[e.targetId]) {
        if (e.eventType === "item_view") statsMap[e.targetId].views += e.count;
        if (e.eventType === "item_click") statsMap[e.targetId].clicks += e.count;
        if (e.eventType === "add_to_cart") statsMap[e.targetId].cartAdds += e.count;
      }
    });

    // Calculate score
    const scoredItems = items.map(item => {
      const stats = statsMap[item._id.toString()];
      // Weights: Orders(50%), CartAdds(25%), Clicks(15%), Views(10%)
      const popularityScore = (stats.orders * 5) + (stats.cartAdds * 2.5) + (stats.clicks * 1.5) + (stats.views * 1.0);
      
      return {
        _id: item.name, // using name for UI
        totalSold: stats.orders,
        revenue: stats.revenue,
        popularityScore,
        views: stats.views,
        conversionRate: stats.views > 0 ? (stats.orders / stats.views) * 100 : 0
      };
    });

    scoredItems.sort((a, b) => b.popularityScore - a.popularityScore);

    // Classify
    const bestSellers = scoredItems.slice(0, 5);
    const slowMovers = [...scoredItems].sort((a, b) => a.popularityScore - b.popularityScore).slice(0, 5);
    
    // Hidden gems: High conversion rate, but low views
    const hiddenGems = [...scoredItems]
      .filter(i => i.views > 5 && i.conversionRate > 20)
      .sort((a, b) => a.views - b.views)
      .slice(0, 5);

    // Trending: recently high cart adds compared to views (simplified approximation here)
    const trending = [...scoredItems]
      .sort((a, b) => (b.popularityScore * b.conversionRate) - (a.popularityScore * a.conversionRate))
      .slice(0, 5);

    return {
      bestSellers,
      slowMovers,
      hiddenGems,
      trending
    };
  }
}
