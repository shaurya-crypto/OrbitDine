"use client";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { OrderCard } from "./OrderCard";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function KitchenBoard({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useRealtimeOrders(restaurantId);
  const queryClient = useQueryClient();
  const prevOrderCountRef = useRef(0);

  useEffect(() => {
    if (orders) {
      prevOrderCountRef.current = orders.length;
    }
  }, [orders]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  const activeOrders = orders || [];

  const received = activeOrders.filter((o: any) => o.status === "received");
  const preparing = activeOrders.filter((o: any) => o.status === "preparing");
  const ready = activeOrders.filter((o: any) => o.status === "ready");
  const served = activeOrders.filter((o: any) => o.status === "served");

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch("/api/orders/status", { orderId, status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["realtimeOrders", restaurantId] });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex space-x-6 h-full overflow-x-auto pb-4 snap-x">
      {/* Column 1: Received */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden snap-center">
        <div className="bg-zinc-900 p-5 flex justify-between items-center border-b border-zinc-800">
          <h2 className="font-serif text-lg text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Received
          </h2>
          <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">{received.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {received.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Column 2: Preparing */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden snap-center">
        <div className="bg-zinc-900 p-5 flex justify-between items-center border-b border-zinc-800">
          <h2 className="font-serif text-lg text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Preparing
          </h2>
          <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">{preparing.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {preparing.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Column 3: Ready */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden snap-center">
        <div className="bg-zinc-900 p-5 flex justify-between items-center border-b border-zinc-800">
          <h2 className="font-serif text-lg text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Ready to Serve
          </h2>
          <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">{ready.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ready.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Column 4: Served */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden snap-center">
        <div className="bg-zinc-900 p-5 flex justify-between items-center border-b border-zinc-800 opacity-60">
          <h2 className="font-serif text-lg text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            Served (Today)
          </h2>
          <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">{served.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 opacity-60">
          {served.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} isServed />
          ))}
        </div>
      </div>
    </div>
  );
}
