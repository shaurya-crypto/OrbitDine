"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { IndianRupee, Receipt, Users, Clock, TrendingUp } from "lucide-react";

export function OwnerCards({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  const Skeletons = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl animate-pulse flex flex-col gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full" />
          <div className="w-20 h-4 bg-zinc-800 rounded" />
          <div className="w-16 h-8 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );

  if (isLoading) return <Skeletons />;
  if (!analytics) return <div className="text-zinc-500 py-6 text-center">No analytics data available yet. Data will appear once orders start coming in.</div>;

  const fmt = (v: number | undefined | null) => v != null ? `₹${v.toFixed(2)}` : "N/A";

  const cards = [
    { title: "Revenue Today", value: fmt(analytics.revenueToday), icon: <IndianRupee size={20} className="text-emerald-400" />, bg: "bg-emerald-500/10" },
    { title: "Orders Today", value: analytics.totalOrdersToday ?? "N/A", icon: <Receipt size={20} className="text-blue-400" />, bg: "bg-blue-500/10" },
    { title: "Active Tables", value: analytics.activeTables ?? "N/A", icon: <Users size={20} className="text-purple-400" />, bg: "bg-purple-500/10" },
    { title: "Kitchen Load", value: analytics.averagePreparationTime != null ? `${analytics.averagePreparationTime}m Avg` : "N/A", icon: <Clock size={20} className="text-orange-400" />, bg: "bg-orange-500/10" },
    { title: "Avg Order Value", value: analytics.totalOrdersToday > 0 ? fmt(analytics.averageOrderValueToday) : "N/A", icon: <TrendingUp size={20} className="text-indigo-400" />, bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">{card.title}</p>
            <p className="text-2xl font-serif text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
