"use client";

import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";
import { Loader } from "@/components/ui/Loader";
import { DollarSign, Receipt, Users, Clock } from "lucide-react";

export function OverviewCards({ restaurantId }: { restaurantId: string }) {
  const { data: overview, isLoading } = useRealtimeOverview(restaurantId);

  if (isLoading) return <div className="p-4"><Loader /></div>;
  if (!overview) return null;

  const cards = [
    { title: "Revenue Today", value: `$${overview.revenueToday.toFixed(2)}`, icon: <DollarSign size={20} />, color: "text-green-600", bg: "bg-green-100" },
    { title: "Orders Today", value: overview.ordersToday, icon: <Receipt size={20} />, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active Tables", value: overview.activeTables, icon: <Users size={20} />, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Avg Ticket Time", value: `${overview.avgTicketTime}m`, icon: <Clock size={20} />, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-neutral-500 text-sm font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
