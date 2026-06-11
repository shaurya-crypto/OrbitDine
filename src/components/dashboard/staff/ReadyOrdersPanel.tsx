"use client";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { Loader } from "@/components/ui/Loader";
import { CheckCircle2, Utensils } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

import { useToast } from "@/components/ui/ToastProvider";

export function ReadyOrdersPanel({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useRealtimeOrders(restaurantId);
  const queryClient = useQueryClient();
  const { userId } = useAuthStore(); 
  const toast = useToast();

  if (isLoading) return <div className="p-6 flex justify-center"><Loader /></div>;

  const readyOrders = (orders || []).filter((o: any) => o.status === "ready");

  const handleMarkServed = async (orderId: string) => {
    try {
      await axios.patch("/api/orders/status", { 
        orderId, 
        status: "served",
        servedBy: userId
      });
      queryClient.invalidateQueries({ queryKey: ["realtimeOrders", restaurantId] });
      toast.success("Order marked as served.");
    } catch (err) {
      toast.error("Failed to mark order as served.");
    }
  };

  if (readyOrders.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-8 text-center border border-border">
        <Utensils className="mx-auto text-text-secondary opacity-50 mb-3" size={32} />
        <h3 className="text-text-secondary font-medium">No orders ready to serve</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {readyOrders.map((order: any) => {
        const formattedTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
        return (
          <div key={order._id} className="bg-surface rounded-xl shadow-sm border border-border p-4 relative overflow-hidden transition-colors hover:border-accent/50">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 rounded-md uppercase tracking-wider">
                  Table {order.tableId?.tableNumber || order.tableId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] bg-base px-2 py-0.5 rounded text-text-secondary border border-border">
                  {formattedTime} ({timeElapsed}m)
                </span>
              </div>
            </div>

          <div className="mb-4 space-y-1">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="text-sm flex justify-between">
                <span><span className="font-medium">{item.quantity}x</span> {item.name}</span>
              </div>
            ))}
          </div>

            <button 
              onClick={() => handleMarkServed(order._id)}
              className="w-full bg-accent text-white font-medium py-2 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              <CheckCircle2 size={16} />
              <span>Mark Served</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
