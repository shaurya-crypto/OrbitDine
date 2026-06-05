"use client";

import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";
import { Users, CheckCircle2, Receipt } from "lucide-react";

export function StaffCards({ restaurantId }: { restaurantId: string }) {
  const { data: overview, isLoading } = useRealtimeOverview(restaurantId);

  const Skeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl animate-pulse flex flex-col gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full" />
          <div className="w-20 h-4 bg-zinc-800 rounded" />
          <div className="w-16 h-8 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );

  if (isLoading) return <Skeletons />;
  if (!overview) return <div className="text-zinc-500">No data available.</div>;

  const cards = [
    { title: "Tables Waiting", value: overview.ordersInQueue, icon: <Users size={20} className="text-blue-400" />, bg: "bg-blue-500/10" },
    { title: "Ready Orders", value: overview.readyOrders, icon: <CheckCircle2 size={20} className="text-emerald-400" />, bg: "bg-emerald-500/10" },
    { title: "Bill Requests", value: overview.billsPending, icon: <Receipt size={20} className="text-orange-400" />, bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
