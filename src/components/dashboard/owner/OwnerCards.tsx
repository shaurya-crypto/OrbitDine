"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { MetricCard } from "@/components/dashboard/ui/MetricCard";
import { SkeletonMetric } from "@/components/dashboard/ui/Skeleton";
import { IndianRupee, Receipt, Users, Clock, Star, Crown, Activity } from "lucide-react";

export function OwnerCards({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonMetric key={i} />)}
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-text-secondary text-[13px] py-4 text-center">No summary data available yet.</div>;
  }

  const fmt = (v: number | undefined | null) => v != null ? `₹${v.toFixed(0)}` : "N/A";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <MetricCard
        label="Revenue Today"
        value={fmt(analytics.revenueToday)}
        icon={<IndianRupee size={16} className="text-emerald-400" />}
      />
      <MetricCard
        label="Orders Today"
        value={analytics.totalOrdersToday ?? "0"}
        icon={<Receipt size={16} className="text-blue-400" />}
      />
      <MetricCard
        label="Active Tables"
        value={analytics.activeTables ?? "0"}
        icon={<Users size={16} className="text-purple-400" />}
      />
      <MetricCard
        label="Pending Orders"
        value={analytics.pendingOrders ?? "0"}
        icon={<Clock size={16} className="text-orange-400" />}
      />
      <MetricCard
        label="Avg Rating"
        value={analytics.averageRating ?? "0.0"}
        icon={<Star size={16} className="text-yellow-400" />}
      />
      <MetricCard
        label="Top Seller"
        value={analytics.topSellingItem?.length > 12 ? analytics.topSellingItem.slice(0, 10) + '..' : analytics.topSellingItem ?? "None"}
        icon={<Crown size={16} className="text-pink-400" />}
      />
    </div>
  );
}
