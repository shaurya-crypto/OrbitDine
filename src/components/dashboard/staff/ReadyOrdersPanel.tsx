"use client";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { Loader } from "@/components/ui/Loader";
import { CheckCircle2, Utensils } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

export function ReadyOrdersPanel({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useRealtimeOrders(restaurantId);
  const queryClient = useQueryClient();
  const { userId } = useAuthStore(); 

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
    } catch (err) {
      alert("Failed to mark order as served.");
    }
  };

  if (readyOrders.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-100">
        <Utensils className="mx-auto text-neutral-300 mb-3" size={32} />
        <h3 className="text-neutral-500 font-medium">No orders ready to serve</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {readyOrders.map((order: any) => (
        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-orange-200 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded-md uppercase tracking-wider">
                Table {order.tableId?.tableNumber || order.tableId}
              </span>
            </div>
            <span className="text-xs font-medium text-neutral-500">
              {order.orderNumber}
            </span>
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
            className="w-full bg-orange-500 text-white font-medium py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle2 size={16} />
            <span>Mark Served</span>
          </button>
        </div>
      ))}
    </div>
  );
}
