"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/Loader";

export function RevenueCharts({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetch(`/api/restaurant/analytics?restaurantId=${restaurantId}`)
        .then(res => res.ok ? res.json() : null)
        .then(d => setData(d))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [restaurantId]);

  if (loading) return <div className="p-12 flex justify-center"><Loader /></div>;

  if (!data || !data.hourlyData) {
    return (
      <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
        <p className="text-zinc-500 text-sm font-medium">No data available</p>
        <p className="text-zinc-600 text-xs mt-1">Graphs will render once data is fetched.</p>
      </div>
    );
  }

  const hourlyData = data.hourlyData || [];
  const last7Days = data.last7DaysData || [];
  const maxHourly = Math.max(...hourlyData.map((h: any) => h.revenue), 1);
  const max7Day = Math.max(...last7Days.map((d: any) => d.revenue), 1);
  const totalHourlyRevenue = hourlyData.reduce((s: number, h: any) => s + h.revenue, 0);
  const total7DayRevenue = last7Days.reduce((s: number, d: any) => s + d.revenue, 0);

  return (
    <div className="space-y-8">
      {/* Hourly Revenue Today */}
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <h4 className="text-sm font-medium text-zinc-400">Hourly Revenue (Today)</h4>
          <span className="text-xs text-zinc-500">
            {totalHourlyRevenue > 0 ? `₹${totalHourlyRevenue.toFixed(2)} total` : "No revenue today"}
          </span>
        </div>
        {totalHourlyRevenue === 0 ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600 text-sm font-medium">No data available</p>
          </div>
        ) : (
          <div className="flex items-end gap-[2px] h-40 px-1">
            {hourlyData.map((h: any, i: number) => {
              const height = `${(h.revenue / maxHourly) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative min-w-[6px]" style={{ height: "100%" }}>
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
                    style={{ height: h.revenue > 0 ? height : "2px", minHeight: h.revenue > 0 ? "4px" : "1px", opacity: h.revenue > 0 ? 1 : 0.15 }}
                  />
                  {h.revenue > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity border border-zinc-700">
                      {h.hour}: ₹{h.revenue.toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between mt-2 text-[10px] text-zinc-600 px-1">
          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
        </div>
      </div>

      {/* 7-Day Revenue */}
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <h4 className="text-sm font-medium text-zinc-400">Revenue (Last 7 Days)</h4>
          <span className="text-xs text-zinc-500">
            {total7DayRevenue > 0 ? `₹${total7DayRevenue.toFixed(2)} total` : "No revenue this week"}
          </span>
        </div>
        {total7DayRevenue === 0 ? (
          <div className="h-36 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600 text-sm font-medium">No data available</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-36 px-1">
            {last7Days.map((d: any, i: number) => {
              const height = `${(d.revenue / max7Day) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative max-w-[50px]" style={{ height: "100%" }}>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-300 bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300"
                      style={{ height: d.revenue > 0 ? height : "2px", minHeight: d.revenue > 0 ? "6px" : "2px", opacity: d.revenue > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">{d.date}</span>
                  {d.revenue > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity border border-zinc-700">
                      ₹{d.revenue.toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
