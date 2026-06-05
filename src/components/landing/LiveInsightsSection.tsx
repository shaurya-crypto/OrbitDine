"use client";

import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";
import { Loader } from "@/components/ui/Loader";
import { TrendingUp, Users, Clock, Receipt, IndianRupee } from "lucide-react";

const DEMO_RESTAURANT_ID = "6a1fe9fab618d810aa87f619";

export function LiveInsightsSection() {
  const { data: overview, isLoading } = useRealtimeOverview(DEMO_RESTAURANT_ID);

  return (
    <section className="w-full py-24 md:py-32 bg-surface border-y border-border overflow-hidden" id="insights">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-mono text-green-500 uppercase tracking-widest font-semibold">Live Data Preview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-4">
            Real Insights, Right Now
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            This is live data streaming directly from one of our demo restaurants using OrbitDine today.
          </p>
        </div>

        <div className="relative w-full max-w-[1000px] mx-auto">
          {/* Decorative background glow */}
          <div className="absolute inset-0 bg-accent/5 rounded-3xl blur-[80px] pointer-events-none" />

          <div className="relative z-10 bg-base border border-border rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-70">
                <Loader />
                <p className="mt-4 text-sm text-text-secondary font-mono">Fetching live operations data...</p>
              </div>
            ) : overview ? (
              <div className="space-y-8">
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface p-6 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <IndianRupee size={16} />
                      <span className="text-xs font-mono uppercase">Revenue Today</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">
                      ₹{overview.revenueToday.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-surface p-6 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <Users size={16} />
                      <span className="text-xs font-mono uppercase">Active Tables</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">
                      {overview.activeTables}
                    </p>
                  </div>

                  <div className="bg-surface p-6 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <Receipt size={16} />
                      <span className="text-xs font-mono uppercase">Orders Today</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">
                      {overview.ordersToday}
                    </p>
                  </div>

                  <div className="bg-surface p-6 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <Clock size={16} />
                      <span className="text-xs font-mono uppercase">Avg Service Time</span>
                    </div>
                    <p className="text-2xl font-semibold text-text-primary">
                      {overview.avgTicketTime} <span className="text-sm font-normal text-text-secondary">min</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Top Selling Items */}
                  <div>
                    <h3 className="text-sm font-mono text-text-secondary uppercase mb-4 flex items-center gap-2">
                      <TrendingUp size={16} /> Top Selling Items
                    </h3>
                    <div className="space-y-3">
                      {overview.topSellingItems?.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/30">
                          <span className="font-medium text-text-primary text-sm">{item.name}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-text-secondary">{item.quantity} sold</span>
                          </div>
                        </div>
                      ))}
                      {(!overview.topSellingItems || overview.topSellingItems.length === 0) && (
                        <div className="p-4 text-center text-text-secondary text-sm bg-surface rounded-xl border border-border/30">
                          No items sold today yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hourly Activity (Fake Chart representation) */}
                  <div>
                    <h3 className="text-sm font-mono text-text-secondary uppercase mb-4 flex items-center gap-2">
                      <ActivityIcon /> Hourly Activity
                    </h3>
                    <div className="h-48 flex items-end justify-between gap-2 p-4 bg-surface border border-border/30 rounded-xl relative">
                      {/* Grid lines */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-border/20" />
                      <div className="absolute inset-x-0 top-2/4 border-t border-border/20" />
                      <div className="absolute inset-x-0 top-3/4 border-t border-border/20" />
                      
                      {overview.peakHours && overview.peakHours.length > 0 ? (
                        overview.peakHours.map((ph: any, i: number) => {
                          // Find max orders to calculate height percentage
                          const maxOrders = Math.max(...overview.peakHours.map((p: any) => p.orders));
                          const heightPct = Math.max((ph.orders / maxOrders) * 100, 5);
                          return (
                            <div key={i} className="flex flex-col items-center flex-1 gap-2 z-10 group relative">
                              {/* Tooltip */}
                              <div className="absolute -top-8 bg-base text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-border pointer-events-none">
                                {ph.orders} orders
                              </div>
                              <div 
                                className="w-full bg-accent/40 rounded-t-sm group-hover:bg-accent/60 transition-colors"
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[10px] text-text-secondary font-mono">{ph.hour}:00</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
                          No activity data for today.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-text-secondary">
                Failed to load live data.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
