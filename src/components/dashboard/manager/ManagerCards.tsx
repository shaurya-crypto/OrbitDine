"use client";

import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";
import { MetricCard } from "@/components/dashboard/ui/MetricCard";
import { SkeletonMetric } from "@/components/dashboard/ui/Skeleton";
import { Users, Clock, CheckCircle2, Receipt } from "lucide-react";

export function ManagerCards({ restaurantId }: { restaurantId: string }) {
  const { data: overview, isLoading } = useRealtimeOverview(restaurantId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <SkeletonMetric key={i} />)}
      </div>
    );
  }

  if (!overview) {
    return <div className="text-text-secondary text-[13px] py-4">No data available.</div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        label="Active Tables"
        value={overview.activeTables}
        icon={<Users size={16} className="text-purple-400" />}
      />
      <MetricCard
        label="Orders In Queue"
        value={overview.ordersInQueue}
        icon={<Clock size={16} className="text-blue-400" />}
      />
      <MetricCard
        label="Ready Orders"
        value={overview.readyOrders}
        icon={<CheckCircle2 size={16} className="text-emerald-400" />}
      />
      <MetricCard
        label="Bill Requests"
        value={overview.billsPending}
        icon={<Receipt size={16} className="text-orange-400" />}
      />
    </div>
  );
}
