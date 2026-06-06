"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";
import { TrendingUp, ShoppingBag, DollarSign, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { restaurantId } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) fetchAnalytics();
  }, [restaurantId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/restaurant/analytics?restaurantId=${restaurantId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;
  if (!data) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900 mb-1">Business Analytics</h1>
        <p className="text-neutral-500">Overview of your restaurant's performance.</p>
      </div>
      <div className="p-12 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
        <p className="text-lg font-medium mb-2">No Analytics Data Yet</p>
        <p className="text-sm">Analytics will populate automatically once your restaurant starts receiving orders.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900 mb-1">Business Analytics</h1>
        <p className="text-neutral-500">Overview of your restaurant's performance today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassPanel className="p-6 border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
            <h3 className="font-medium text-sm">Today's Revenue</h3>
          </div>
          <p className="text-3xl font-serif text-neutral-900">₹{(data.revenueToday ?? 0).toFixed(2)}</p>
        </GlassPanel>

        <GlassPanel className="p-6 border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
            <h3 className="font-medium text-sm">Orders Today</h3>
          </div>
          <p className="text-3xl font-serif text-neutral-900">{data.totalOrdersToday ?? 0}</p>
        </GlassPanel>

        <GlassPanel className="p-6 border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Activity size={20} /></div>
            <h3 className="font-medium text-sm">Avg Order Value</h3>
          </div>
          <p className="text-3xl font-serif text-neutral-900">
            ₹{data.totalOrdersToday > 0 ? (data.revenueToday / data.totalOrdersToday).toFixed(2) : "0.00"}
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="font-medium text-sm">Top Item</h3>
          </div>
          <p className="text-xl font-serif text-neutral-900 truncate">
            {data.popularItems?.[0]?._id || "N/A"}
          </p>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassPanel className="p-6 border-neutral-200 h-96 flex flex-col mb-6">
            <h3 className="text-lg font-semibold mb-6 text-neutral-900">Hourly Revenue (Today)</h3>
            <div className="flex-1 flex items-end gap-2 px-4 pb-4 overflow-x-auto">
              {data.hourlyData.map((d: any, i: number) => {
                const maxRev = Math.max(...data.hourlyData.map((x: any) => x.revenue), 1);
                const height = `${(d.revenue / maxRev) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[20px]">
                    <div className="w-full bg-neutral-100 rounded-t-sm relative flex items-end group-hover:bg-neutral-200 transition-colors" style={{ height: "100%" }}>
                      <div className="w-full bg-neutral-900 rounded-t-sm transition-all" style={{ height }} />
                      
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                        ₹{d.revenue.toFixed(2)}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 rotate-45 origin-top-left">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 border-neutral-200 h-96 flex flex-col">
            <h3 className="text-lg font-semibold mb-6 text-neutral-900">Revenue (Last 7 Days)</h3>
            <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 overflow-x-auto">
              {data.last7DaysData?.map((d: any, i: number) => {
                const maxRev = Math.max(...(data.last7DaysData?.map((x: any) => x.revenue) || [1]), 1);
                const height = `${(d.revenue / maxRev) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[30px] max-w-[60px]">
                    <div className="w-full bg-neutral-100 rounded-t-sm relative flex items-end group-hover:bg-neutral-200 transition-colors" style={{ height: "100%" }}>
                      <div className="w-full bg-accent rounded-t-sm transition-all" style={{ height }} />
                      
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                        ₹{d.revenue.toFixed(2)}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-600 font-medium">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-1">
          <GlassPanel className="p-6 border-neutral-200 h-full">
            <h3 className="text-lg font-semibold mb-6 text-neutral-900">Most Popular Items</h3>
            <div className="space-y-4">
              {data.popularItems.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-500">
                      {i + 1}
                    </div>
                    <p className="font-medium text-neutral-900 text-sm truncate max-w-[120px]">{item._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">{item.totalSold}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Sold</p>
                  </div>
                </div>
              ))}
              {data.popularItems.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-8">No orders yet.</p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
