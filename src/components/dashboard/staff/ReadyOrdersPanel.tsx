"use client";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { SkeletonCard } from "@/components/dashboard/ui/Skeleton";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
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

  if (isLoading) return <div className="space-y-3"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>;

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
      <div className="card">
        <EmptyState 
          icon={Utensils} 
          title="No orders ready" 
          description="Orders marked ready by the kitchen will appear here."
          compact
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {readyOrders.map((order: any) => {
        const formattedTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
        
        return (
          <button 
            key={order._id} 
            onClick={() => handleMarkServed(order._id)}
            className="w-full text-left card p-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded uppercase tracking-wider">
                  Table {order.tableId?.tableNumber || order.tableId}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-medium text-text-primary">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {timeElapsed}m ago
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4 border-t border-border/50 pt-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-baseline gap-2">
                  <span className="text-[13px] text-text-primary truncate">
                    <span className="text-text-secondary mr-2">{item.quantity}x</span>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full bg-emerald-500 text-white font-medium py-2 rounded-lg text-[13px] hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              Mark Served
            </div>
          </button>
        );
      })}
    </div>
  );
}
