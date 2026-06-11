"use client";

import { Clock, AlertTriangle, Play, Check, X, Trash2 } from "lucide-react";

interface OrderCardProps {
  order: any;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isServed?: boolean;
  canCancel?: boolean;
}

export function OrderCard({ order, onStatusChange, isServed, canCancel, onItemCancel }: OrderCardProps & { onItemCancel?: (orderId: string, itemId: string) => Promise<void> }) {
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = timeElapsed >= 20 && !isServed && order.status !== "ready";
  
  const formattedTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-zinc-900 rounded-2xl shadow-xl border p-5 transition-all ${isUrgent ? 'border-red-500/50 shadow-red-500/10' : 'border-zinc-800'}`}>
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-xl text-white leading-none">
              #{order.orderNumber.split('-')[1]}
            </h3>
            <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-md">{formattedTime}</span>
          </div>
          <p className="text-sm font-medium text-accent">
            Table: {order.tableId?.tableNumber || order.tableId}
          </p>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
          isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {isUrgent ? <AlertTriangle size={14} className="animate-pulse" /> : <Clock size={14} />}
          <span>{timeElapsed}m</span>
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="text-sm border-l-2 border-zinc-800 pl-3 py-0.5">
            <div className="flex justify-between font-medium text-white mb-1">
              <span><span className="text-accent">{item.quantity}x</span> {item.name}</span>
              {canCancel && !isServed && order.status !== "ready" && onItemCancel && (
                <button 
                  onClick={() => onItemCancel(order._id, item._id)} 
                  className="text-zinc-600 hover:text-red-400 p-1 rounded-md transition-colors"
                  title="Cancel item"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="text-xs text-zinc-500 font-mono">
                + {item.addons.map((a: any) => a.name).join(", ")}
              </div>
            )}
          </div>
        ))}
        {order.notes && (
          <div className="bg-orange-500/10 text-orange-400 text-xs p-3 rounded-xl border border-orange-500/20 mt-4">
            <strong className="block mb-1 uppercase tracking-wider text-[10px] opacity-80">Kitchen Note</strong> 
            {order.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isServed && (
        <div className="pt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            {order.status === "received" && (
              <button
                onClick={() => onStatusChange(order._id, "preparing")}
                className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 font-medium py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Play size={16} /> Start Prep
              </button>
            )}
            {order.status === "preparing" && (
              <button
                onClick={() => onStatusChange(order._id, "ready")}
                className="flex-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 font-medium py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} /> Mark Ready
              </button>
            )}
          </div>
          
          {canCancel && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to cancel this entire order ticket?")) {
                  try {
                    await fetch("/api/orders/cancel", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: order._id, reason: "Cancelled by kitchen" })
                    });
                    // Note: If KitchenBoard re-fetches, it will disappear.
                  } catch(e) {}
                }
              }}
              className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Cancel Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}

