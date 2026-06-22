"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
import { SkeletonCard } from "@/components/dashboard/ui/Skeleton";
import { BarChart3, ShoppingBag, Star, TrendingUp } from "lucide-react";

export function RevenueCharts({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonCard lines={6} />
      <SkeletonCard lines={6} />
    </div>
  );

  if (!analytics || !analytics.hourlyData) {
    return (
      <div className="card">
        <EmptyState 
          icon={BarChart3} 
          title="No analytics yet" 
          description="Charts will appear once your restaurant starts processing orders."
          compact
        />
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Hourly Revenue Today */}
        <div className="card p-4">
          <div className="flex justify-between items-baseline mb-4">
            <h4 className="text-card-title text-text-primary">Today's Revenue</h4>
            <span className="text-caption text-emerald-400 font-medium">
              {totalHourlyRevenue > 0 ? `${fmt(totalHourlyRevenue)} total` : "No revenue"}
            </span>
          </div>
          {totalHourlyRevenue === 0 ? (
            <EmptyState icon={TrendingUp} title="Awaiting orders" description="Revenue will appear as orders are completed." compact />
          ) : (
            <div className="relative">
              <div className="flex items-end gap-[2px] h-28 px-1">
                {hourlyData.map((h: any, i: number) => {
                  const height = `${(h.revenue / maxHourly) * 100}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative min-w-[2px]" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-t-sm transition-colors bg-emerald-500/70 group-hover:bg-emerald-400"
                        style={{ height: h.revenue > 0 ? height : "1px", minHeight: h.revenue > 0 ? "2px" : "1px", opacity: h.revenue > 0 ? 1 : 0.1 }}
                      />
                      {h.revenue > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-elevated text-text-primary text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity border border-border shadow-lg">
                          {h.hour} • {fmt(h.revenue)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-medium text-text-tertiary px-1">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Revenue Trend */}
        <div className="card p-4">
          <div className="flex justify-between items-baseline mb-4">
            <h4 className="text-card-title text-text-primary">7-Day Trend</h4>
            <span className="text-caption text-indigo-400 font-medium">
              {total7DayRevenue > 0 ? `${fmt(total7DayRevenue)} total` : "No revenue"}
            </span>
          </div>
          {total7DayRevenue === 0 ? (
            <EmptyState icon={BarChart3} title="Awaiting orders" description="Trend data builds over multiple days of operation." compact />
          ) : (
            <div className="flex items-end justify-between gap-2 h-28 px-1">
              {last7Days.map((d: any, i: number) => {
                const height = `${(d.revenue / max7Day) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative max-w-[40px]" style={{ height: "100%" }}>
                    <div className="w-full flex-1 flex items-end relative">
                      <div
                        className="w-full rounded-t transition-colors bg-indigo-500/60 group-hover:bg-indigo-400"
                        style={{ height: d.revenue > 0 ? height : "1px", minHeight: d.revenue > 0 ? "4px" : "1px", opacity: d.revenue > 0 ? 1 : 0.15 }}
                      />
                      {d.revenue > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-elevated text-text-primary text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity border border-border shadow-lg">
                          {fmt(d.revenue)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-text-tertiary font-medium">{d.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Popular Items */}
        <div className="card p-4">
          <div className="flex justify-between items-baseline mb-4">
            <h4 className="text-card-title text-text-primary">Top Selling</h4>
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">30 Days</span>
          </div>
          {popularItems.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No data yet" description="Sell items to see popularity trends." compact />
          ) : (
            <div className="space-y-3">
              {popularItems.map((item: any, i: number) => {
                const width = `${(item.totalSold / maxPopular) * 100}%`;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-text-primary truncate pr-3">{item._id}</span>
                      <span className="text-text-tertiary whitespace-nowrap">{item.totalSold}</span>
                    </div>
                    <div className="w-full h-1.5 bg-text-primary/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/60 rounded-full transition-all duration-700 ease-out" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Pipeline */}
        <div className="card p-4 flex flex-col">
          <div className="flex justify-between items-baseline mb-4">
            <h4 className="text-card-title text-text-primary">Pipeline</h4>
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{totalActiveOrders} Active</span>
          </div>
          {totalActiveOrders === 0 ? (
            <div className="flex-1">
              <EmptyState icon={BarChart3} title="No active orders" description="Order pipeline status appears here." compact />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="w-full flex h-3 rounded-full overflow-hidden bg-text-primary/5">
                <div style={{ width: `${(statusBreakdown.received / totalActiveOrders) * 100}%` }} className="bg-red-400 transition-all" title={`Received: ${statusBreakdown.received}`} />
                <div style={{ width: `${(statusBreakdown.preparing / totalActiveOrders) * 100}%` }} className="bg-orange-400 transition-all" title={`Preparing: ${statusBreakdown.preparing}`} />
                <div style={{ width: `${(statusBreakdown.ready / totalActiveOrders) * 100}%` }} className="bg-yellow-400 transition-all" title={`Ready: ${statusBreakdown.ready}`} />
                <div style={{ width: `${(statusBreakdown.served / totalActiveOrders) * 100}%` }} className="bg-emerald-400 transition-all" title={`Served: ${statusBreakdown.served}`} />
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                {[
                  { label: "Received", count: statusBreakdown.received, color: "bg-red-400" },
                  { label: "Preparing", count: statusBreakdown.preparing, color: "bg-orange-400" },
                  { label: "Ready", count: statusBreakdown.ready, color: "bg-yellow-400" },
                  { label: "Served", count: statusBreakdown.served, color: "bg-emerald-400" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-[11px] font-medium text-text-secondary">{s.label} ({s.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating Trend */}
        <div className="card p-4">
          <div className="flex justify-between items-baseline mb-4">
            <h4 className="text-card-title text-text-primary">Ratings</h4>
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">7 Days</span>
          </div>
          {ratingTrend.length === 0 || ratingTrend.every((d: any) => d.rating == null) ? (
            <EmptyState icon={Star} title="No reviews yet" description="Rating trends show once customers leave feedback." compact />
          ) : (
            <div className="flex items-end justify-between gap-2 h-24 px-1">
              {ratingTrend.map((d: any, i: number) => {
                const height = d.rating != null ? `${(d.rating / maxRating) * 100}%` : "0%";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative max-w-[40px]" style={{ height: "100%" }}>
                    <div className="w-full flex-1 flex items-end relative">
                      {d.rating != null ? (
                        <div
                          className="w-full rounded-t transition-colors bg-yellow-500/50 group-hover:bg-yellow-400"
                          style={{ height, minHeight: "4px" }}
                        />
                      ) : (
                        <div className="w-full bg-text-primary/5 rounded-t" style={{ height: "2px" }} />
                      )}
                      {d.rating != null && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-elevated text-text-primary text-[10px] font-medium py-0.5 px-2 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity border border-border shadow-lg">
                          {d.rating} ★
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-text-tertiary font-medium">{d.date}</span>
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
