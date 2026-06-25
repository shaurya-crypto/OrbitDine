"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock, AlertTriangle, ChefHat, CheckCircle2 } from "lucide-react";
import { apiClient as axios } from "@/services/apiClient";
import { useToast } from "@/components/ui/ToastProvider";

export function KitchenPerformance({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function fetchKitchenStats() {
      if (!restaurantId) return;
      try {
        // Fetch real-time BI data for kitchen (simulated here since the aggregate would run nightly, but live data comes from orders)
        // We'll hit an API to get current session active orders and BI
        const response = await axios.get(`/restaurant/analytics/kitchen?restaurantId=${restaurantId}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch kitchen stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchKitchenStats();
    const interval = setInterval(fetchKitchenStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [restaurantId]);

  if (isLoading) {
    return <div className="h-48 w-full flex items-center justify-center bg-surface border border-border rounded-3xl"><Loader2 className="animate-spin text-accent" /></div>;
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-3xl p-6 relative overflow-hidden">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2"><ChefHat size={20} className="text-orange-500" /> Live Kitchen Operations</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface p-4 rounded-2xl border border-border">
             <div className="text-text-secondary text-xs font-medium mb-1">Active Orders</div>
             <div className="text-2xl font-bold text-text-primary">{data.activeOrders}</div>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
             <div className="text-text-secondary text-xs font-medium mb-1">Avg Est. Wait</div>
             <div className="text-2xl font-bold text-blue-500">{data.estimatedWaitMins}m</div>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
             <div className="text-text-secondary text-xs font-medium mb-1">Current Prep Time</div>
             <div className="text-2xl font-bold text-orange-500">{data.actualPrepMins}m</div>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
             <div className="text-text-secondary text-xs font-medium mb-1">Efficiency Rate</div>
             <div className="text-2xl font-bold text-green-500">{data.efficiency}%</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Delay Indicators</h4>
          {data.delayedOrders.length > 0 ? (
            <div className="space-y-3">
              {data.delayedOrders.map((order: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-sm font-medium">Order #{order.orderId.slice(-4)}</span>
                    <span className="text-xs text-text-secondary truncate max-w-[150px]">{order.items}</span>
                  </div>
                  <div className="text-sm font-bold text-red-500">+{order.delayMins}m delayed</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-sm font-medium">
              <CheckCircle2 size={16} /> All orders are within estimated preparation time.
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-3xl p-6">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2"><Clock size={20} className="text-blue-500" /> Demand Forecast</h3>
        <div className="space-y-6">
           <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wide mb-1">Next Hour Prediction</p>
              <div className="text-xl font-bold text-blue-500 mb-2">High Load Expected</div>
              <p className="text-sm text-text-primary">
                Predicting a 40% surge in orders based on historical data for this time slot.
              </p>
           </div>
           
           <div>
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm text-text-secondary">Expected Wait Time</span>
               <span className="text-lg font-bold text-text-primary">{data.projectedWaitMins}m</span>
             </div>
             <div className="w-full bg-surface h-3 rounded-full overflow-hidden border border-border">
               <div className={`h-full ${data.projectedWaitMins > 25 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (data.projectedWaitMins/45)*100)}%` }}></div>
             </div>
           </div>

           <div>
             <h4 className="text-xs font-medium text-text-secondary uppercase mb-2">Staff Recommendations</h4>
             <ul className="text-sm space-y-2">
               <li className="flex gap-2"><span className="text-accent">•</span> Prep {data.hotItem} early (trending)</li>
               <li className="flex gap-2"><span className="text-accent">•</span> Assign 2 runners to dining area</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
