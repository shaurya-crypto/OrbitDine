"use client";

import { Clock, AlertTriangle, Play, Check, X, Trash2 } from "lucide-react";

interface OrderCardProps {
  order: any;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isServed?: boolean;
  canCancel?: boolean;
  onItemCancel?: (orderId: string, itemId: string) => Promise<void>;
}

export function OrderCard({ order, onStatusChange, isServed, canCancel, onItemCancel }: OrderCardProps) {
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = timeElapsed >= 20 && !isServed && order.status !== "ready";
  
  const formattedTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-surface rounded-2xl shadow-sm border p-4 transition-all ${isUrgent ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-border'}`}>
      <div className="flex justify-between items-start mb-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-sans font-bold text-[18px] text-text-primary leading-none tracking-tight">
              #{order.orderNumber.split('-')[1]}
            </h3>
            <span className="text-[10px] text-text-tertiary bg-base border border-border px-1.5 py-0.5 rounded">{formattedTime}</span>
          </div>
          <p className="text-[12px] font-bold text-accent uppercase tracking-wider">
            Table {order.tableId?.tableNumber || order.tableId}
          </p>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
          isUrgent ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-base text-text-secondary border-border'
        }`}>
          {isUrgent ? <AlertTriangle size={12} className="animate-pulse" /> : <Clock size={12} />}
          <span>{timeElapsed}m</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="text-[13px] border-l-2 border-border pl-2.5 py-0.5">
            <div className="flex justify-between font-medium text-text-primary mb-0.5">
              <span><span className="text-accent mr-1.5">{item.quantity}x</span> {item.name}</span>
              {canCancel && !isServed && order.status !== "ready" && onItemCancel && (
                <button 
                  onClick={() => onItemCancel(order._id, item._id)} 
                  className="text-text-tertiary hover:text-red-500 p-1 rounded transition-colors"
                  title="Cancel item"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="text-[11px] text-text-secondary">
                + {item.addons.map((a: any) => a.name).join(", ")}
              </div>
            )}
          </div>
        ))}
        {order.notes && (
          <div className="bg-orange-500/10 text-orange-500 text-[12px] p-2.5 rounded-xl border border-orange-500/20 mt-3 font-medium">
            <strong className="block mb-0.5 uppercase tracking-wider text-[10px] opacity-80">Kitchen Note</strong> 
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
                className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-medium py-2 rounded-xl text-[13px] transition-all flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Play size={14} /> Start Prep
              </button>
            )}
            {order.status === "preparing" && (
              <button
                onClick={() => onStatusChange(order._id, "ready")}
                className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-medium py-2 rounded-xl text-[13px] transition-all flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Check size={14} /> Mark Ready
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
                  } catch(e) {}
                }
              }}
              className="w-full bg-base text-red-500 hover:bg-red-500/10 border border-border hover:border-red-500/20 font-medium py-1.5 rounded-xl text-[12px] transition-all flex items-center justify-center gap-1.5 min-h-[32px] mt-1"
            >
              <Trash2 size={12} /> Cancel Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}
