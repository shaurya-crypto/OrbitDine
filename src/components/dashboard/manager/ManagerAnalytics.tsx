"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag } from "lucide-react";

export function ManagerAnalytics({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (restaurantId) {
      fetch(`/api/restaurant/analytics?restaurantId=${restaurantId}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, [restaurantId]);

  if (!data) return <div className="animate-pulse bg-zinc-900/50 h-24 rounded-2xl w-full"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Total Orders (Today)</p>
          <p className="text-2xl font-serif text-white">{data.totalOrdersToday}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <ShoppingBag className="text-blue-400" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Most Popular Item</p>
          <p className="text-xl font-serif text-white truncate max-w-[150px]">
            {data.popularItems?.[0]?._id || "N/A"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <TrendingUp className="text-orange-400" />
        </div>
      </div>
    </div>
  );
}
