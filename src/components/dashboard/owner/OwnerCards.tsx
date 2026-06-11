"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { IndianRupee, Receipt, Users, Clock, Star, Crown, Activity } from "lucide-react";

export function OwnerCards({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  const Skeletons = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="bg-surface border border-border p-4 rounded-2xl animate-pulse flex flex-col gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-xl" />
          <div className="w-16 h-3 bg-zinc-800 rounded" />
          <div className="w-12 h-6 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );

  if (isLoading) return <Skeletons />;
  if (!analytics) return <div className="text-text-secondary py-6 text-center">No summary data available yet.</div>;

  const fmt = (v: number | undefined | null) => v != null ? `₹${v.toFixed(2)}` : "N/A";

  const cards = [
    { title: "Revenue Today", value: fmt(analytics.revenueToday), icon: <IndianRupee size={18} className="text-emerald-500" />, bg: "bg-emerald-500/10" },
    { title: "Orders Today", value: analytics.totalOrdersToday ?? "0", icon: <Receipt size={18} className="text-blue-500" />, bg: "bg-blue-500/10" },
    { title: "Pending Orders", value: analytics.pendingOrders ?? "0", icon: <Clock size={18} className="text-orange-500" />, bg: "bg-orange-500/10" },
    { title: "Active Tables", value: analytics.activeTables ?? "0", icon: <Users size={18} className="text-purple-500" />, bg: "bg-purple-500/10" },
    { title: "Avg Rating", value: analytics.averageRating ?? "0.0", icon: <Star size={18} className="text-yellow-500" />, bg: "bg-yellow-500/10" },
    { title: "Top Seller", value: analytics.topSellingItem?.length > 12 ? analytics.topSellingItem.slice(0, 10) + '..' : analytics.topSellingItem ?? "None", icon: <Crown size={18} className="text-pink-500" />, bg: "bg-pink-500/10" },
    { title: "Peak Hour", value: analytics.peakHour ?? "N/A", icon: <Activity size={18} className="text-indigo-500" />, bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-surface border border-border p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bg}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium mb-1 truncate">{card.title}</p>
            <p className="text-xl font-serif text-text-primary tracking-tight">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
