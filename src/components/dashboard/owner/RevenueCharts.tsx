"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { Loader } from "@/components/ui/Loader";

export function RevenueCharts({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  if (isLoading) return <div className="p-12 flex justify-center"><Loader /></div>;

  if (!analytics || !analytics.hourlyData) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-surface/50">
        <p className="text-text-secondary text-sm font-medium">No analytics data available</p>
        <p className="text-text-secondary opacity-70 text-xs mt-2">Graphs will render once orders are processed.</p>
      </div>
    );
  }

  const hourlyData = analytics.hourlyData || [];
  const last7Days = analytics.last7DaysData || [];
  const popularItems = analytics.popularItems || [];
  const statusBreakdown = analytics.orderStatusBreakdown || { received: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
  const ratingTrend = analytics.feedback?.ratingTrend || [];

  const maxHourly = Math.max(...hourlyData.map((h: any) => h.revenue), 1);
  const max7Day = Math.max(...last7Days.map((d: any) => d.revenue), 1);
  const maxPopular = Math.max(...popularItems.map((i: any) => i.totalSold), 1);
  const maxRating = 5;
  
  const totalHourlyRevenue = hourlyData.reduce((s: number, h: any) => s + h.revenue, 0);
  const total7DayRevenue = last7Days.reduce((s: number, d: any) => s + d.revenue, 0);
  const totalActiveOrders = statusBreakdown.received + statusBreakdown.preparing + statusBreakdown.ready + statusBreakdown.served;

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Revenue Today */}
        <div className="bg-surface border border-border p-6 rounded-2xl">
          <div className="flex justify-between items-baseline mb-6">
            <h4 className="text-sm font-semibold tracking-wide text-text-primary">Today's Revenue</h4>
            <span className="text-xs font-medium text-emerald-500">
              {totalHourlyRevenue > 0 ? `${fmt(totalHourlyRevenue)} total` : "No revenue"}
            </span>
          </div>
          {totalHourlyRevenue === 0 ? (
            <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl">
              <p className="text-text-secondary text-sm font-medium">Awaiting orders</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-end gap-1 h-48 px-1">
                {hourlyData.map((h: any, i: number) => {
                  const height = `${(h.revenue / maxHourly) * 100}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative min-w-[4px]" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-t-sm transition-all duration-500 ease-out bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-200"
                        style={{ height: h.revenue > 0 ? height : "2px", minHeight: h.revenue > 0 ? "4px" : "1px", opacity: h.revenue > 0 ? 1 : 0.15 }}
                      />
                      {h.revenue > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-all duration-200 shadow-xl">
                          {h.hour} • {fmt(h.revenue)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-medium text-text-secondary px-1 uppercase tracking-wider">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Revenue Trend */}
        <div className="bg-surface border border-border p-6 rounded-2xl">
          <div className="flex justify-between items-baseline mb-6">
            <h4 className="text-sm font-semibold tracking-wide text-text-primary">7-Day Trend</h4>
            <span className="text-xs font-medium text-indigo-500">
              {total7DayRevenue > 0 ? `${fmt(total7DayRevenue)} total` : "No revenue"}
            </span>
          </div>
          {total7DayRevenue === 0 ? (
            <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl">
              <p className="text-text-secondary text-sm font-medium">Awaiting orders</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-48 px-1">
              {last7Days.map((d: any, i: number) => {
                const height = `${(d.revenue / max7Day) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative max-w-[45px]" style={{ height: "100%" }}>
                    <div className="w-full flex-1 flex items-end relative">
                      <div
                        className="w-full rounded-t-md transition-all duration-500 ease-out bg-gradient-to-t from-indigo-600/80 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300"
                        style={{ height: d.revenue > 0 ? height : "2px", minHeight: d.revenue > 0 ? "8px" : "2px", opacity: d.revenue > 0 ? 1 : 0.2 }}
                      />
                      {d.revenue > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-all duration-200 shadow-xl">
                          {fmt(d.revenue)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase">{d.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Popular Items Chart */}
        <div className="bg-surface border border-border p-6 rounded-2xl lg:col-span-1">
          <div className="flex justify-between items-baseline mb-6">
            <h4 className="text-sm font-semibold tracking-wide text-text-primary">Top Selling Items</h4>
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">Last 30 Days</span>
          </div>
          {popularItems.length === 0 ? (
            <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl">
              <p className="text-text-secondary text-sm font-medium">Not enough data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {popularItems.map((item: any, i: number) => {
                const width = `${(item.totalSold / maxPopular) * 100}%`;
                return (
                  <div key={i} className="group relative">
                    <div className="flex justify-between text-[11px] font-medium mb-1.5">
                      <span className="text-text-primary truncate pr-4">{item._id}</span>
                      <span className="text-text-secondary whitespace-nowrap">{item.totalSold} sold</span>
                    </div>
                    <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col lg:col-span-1">
          <div className="flex justify-between items-baseline mb-6">
            <h4 className="text-sm font-semibold tracking-wide text-text-primary">Today's Pipeline</h4>
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">{totalActiveOrders} Active</span>
          </div>
          {totalActiveOrders === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl min-h-[160px]">
              <p className="text-text-secondary text-sm font-medium">No active orders</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="w-full flex h-6 rounded-full overflow-hidden ring-1 ring-border">
                <div style={{ width: `${(statusBreakdown.received / totalActiveOrders) * 100}%` }} className="bg-red-500 hover:bg-red-400 transition-colors h-full" title={`Received: ${statusBreakdown.received}`} />
                <div style={{ width: `${(statusBreakdown.preparing / totalActiveOrders) * 100}%` }} className="bg-orange-500 hover:bg-orange-400 transition-colors h-full" title={`Preparing: ${statusBreakdown.preparing}`} />
                <div style={{ width: `${(statusBreakdown.ready / totalActiveOrders) * 100}%` }} className="bg-yellow-400 hover:bg-yellow-300 transition-colors h-full" title={`Ready: ${statusBreakdown.ready}`} />
                <div style={{ width: `${(statusBreakdown.served / totalActiveOrders) * 100}%` }} className="bg-emerald-500 hover:bg-emerald-400 transition-colors h-full" title={`Served: ${statusBreakdown.served}`} />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-text-secondary">Received ({statusBreakdown.received})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs font-medium text-text-secondary">Preparing ({statusBreakdown.preparing})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-xs font-medium text-text-secondary">Ready ({statusBreakdown.ready})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-text-secondary">Served ({statusBreakdown.served})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating Trend (Last 7 Days) */}
        <div className="bg-surface border border-border p-6 rounded-2xl lg:col-span-1">
          <div className="flex justify-between items-baseline mb-6">
            <h4 className="text-sm font-semibold tracking-wide text-text-primary">Rating Trend</h4>
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">7 Days</span>
          </div>
          {ratingTrend.length === 0 || ratingTrend.every((d: any) => d.rating == null) ? (
            <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl">
              <p className="text-text-secondary text-sm font-medium">No recent reviews</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-40 px-1">
              {ratingTrend.map((d: any, i: number) => {
                const height = d.rating != null ? `${(d.rating / maxRating) * 100}%` : "0%";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative max-w-[45px]" style={{ height: "100%" }}>
                    <div className="w-full flex-1 flex items-end relative">
                      {d.rating != null ? (
                        <div
                          className="w-full rounded-t-md transition-all duration-500 ease-out bg-gradient-to-t from-yellow-500/80 to-yellow-300"
                          style={{ height, minHeight: "8px" }}
                        />
                      ) : (
                        <div className="w-full bg-border rounded-t-md opacity-20" style={{ height: "4px" }} />
                      )}
                      {d.rating != null && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-all duration-200 shadow-xl flex items-center gap-1">
                          {d.rating} ★
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase">{d.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
