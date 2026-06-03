"use client";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { OrderCard } from "./OrderCard";
import { Loader } from "@/components/ui/Loader";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function KitchenBoard({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useRealtimeOrders(restaurantId);
  const queryClient = useQueryClient();
  const prevOrderCountRef = useRef(0);

  useEffect(() => {
    // Sound/Pulse alert logic for new orders
    if (orders && orders.length > prevOrderCountRef.current) {
      // Play sound
      // const audio = new Audio('/notification.mp3');
      // audio.play().catch(e => console.log('Audio play prevented', e));
    }
    if (orders) {
      prevOrderCountRef.current = orders.length;
    }
  }, [orders]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader /></div>;

  const activeOrders = orders || [];

  const received = activeOrders.filter((o: any) => o.status === "received");
  const preparing = activeOrders.filter((o: any) => o.status === "preparing");
  const ready = activeOrders.filter((o: any) => o.status === "ready");

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update could go here, but for Kitchen dashboard, strict consistency is fine
      await axios.patch("/api/orders/status", { orderId, status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["realtimeOrders", restaurantId] });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex space-x-6 h-full overflow-x-auto pb-4">
      {/* Column 1 */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="bg-neutral-100 rounded-xl p-4 mb-4 flex justify-between items-center">
          <h2 className="font-semibold text-neutral-900">Received</h2>
          <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full text-xs font-bold">{received.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {received.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Column 2 */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="bg-blue-50 rounded-xl p-4 mb-4 flex justify-between items-center border border-blue-100">
          <h2 className="font-semibold text-blue-900">Preparing</h2>
          <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{preparing.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {preparing.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Column 3 */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="bg-green-50 rounded-xl p-4 mb-4 flex justify-between items-center border border-green-100">
          <h2 className="font-semibold text-green-900">Ready to Serve</h2>
          <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">{ready.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {ready.map((order: any) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>
    </div>
  );
}
