"use client";

import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";
import { Loader } from "@/components/ui/Loader";

export function RevenueCharts({ restaurantId }: { restaurantId: string }) {
  const { data: overview, isLoading } = useRealtimeOverview(restaurantId);

  if (isLoading) return <div className="p-12 flex justify-center"><Loader /></div>;
  if (!overview) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mb-8">
      <h3 className="font-semibold text-neutral-900 mb-6">Financial Overview</h3>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-neutral-500 mb-1">Gross Revenue (Today)</p>
          <p className="text-3xl font-serif tracking-tight text-neutral-900">${overview.revenueToday.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Total Orders</p>
          <p className="text-3xl font-serif tracking-tight text-neutral-900">{overview.ordersToday}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 mb-1">Average Order Value</p>
          <p className="text-3xl font-serif tracking-tight text-neutral-900">${overview.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Mock chart area */}
      <div className="mt-8 h-48 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Revenue Timeline Chart Placeholder</p>
      </div>
    </div>
  );
}
