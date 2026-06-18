"use client";

import { useState, useEffect, useRef } from "react";
import { Store, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RestaurantActions } from "./RestaurantActions";

export function RestaurantTable({ initialData }: { initialData: any[] }) {
  const [restaurants, setRestaurants] = useState<any[]>(initialData);
  const [page, setPage] = useState(2); // Since page 1 is initialData
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length >= 10);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, page]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/restaurants/list?page=${page}&limit=10`);
      const data = await res.json();
      
      if (data.restaurants && data.restaurants.length > 0) {
        setRestaurants((prev) => [...prev, ...data.restaurants]);
        setPage((p) => p + 1);
        if (data.restaurants.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more restaurants", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassPanel className="border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500 font-medium bg-zinc-950/50">
              <th className="p-4 pl-6">Restaurant</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Status</th>
              <th className="p-4">Plan</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {restaurants.map((r: any) => (
              <tr key={r._id.toString()} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <Link href={`/admin/restaurants/${r._id}`} className="font-medium text-white hover:text-red-400 transition-colors">
                        {r.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{r.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm text-zinc-300">{r.ownerId?.fullName || "No Owner"}</p>
                    <p className="text-xs text-zinc-500">{r.ownerId?.email || "No Email"}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    r.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                    r.status === "suspended" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {r.status?.toUpperCase() || "PENDING"}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 uppercase">
                    {r.plan || "FREE"}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end">
                    <RestaurantActions id={r._id.toString()} name={r.name} currentStatus={r.status || "pending"} />
                  </div>
                </td>
              </tr>
            ))}
            
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  No restaurants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div ref={loaderRef} className="w-full py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        </div>
      )}
    </GlassPanel>
  );
}
