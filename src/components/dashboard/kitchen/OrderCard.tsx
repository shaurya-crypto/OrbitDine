"use client";

import { Clock, AlertTriangle } from "lucide-react";
import axios from "axios";
import { realtimeService } from "@/services/realtimeService"; // if we want to manually invalidate, but react query refetches

interface OrderCardProps {
  order: any;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = timeElapsed >= 20;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 mb-3 ${isUrgent ? 'border-red-500' : 'border-neutral-200'}`}>
      <div className="flex justify-between items-start mb-3 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="font-bold text-neutral-900 leading-none mb-1">#{order.orderNumber.split('-')[1]}</h3>
          <p className="text-xs text-neutral-500">Table: {order.tableId?.tableNumber || order.tableId}</p>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold ${
          isUrgent ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {isUrgent ? <AlertTriangle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
          {timeElapsed}m
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="text-sm">
            <div className="flex justify-between font-medium text-neutral-900">
              <span>{item.quantity}x {item.name}</span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="pl-4 text-xs text-neutral-500 mt-1">
                + {item.addons.map((a: any) => a.name).join(", ")}
              </div>
            )}
          </div>
        ))}
        {order.notes && (
          <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded-md border border-yellow-200">
            <strong>Note:</strong> {order.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-neutral-100 flex gap-2">
        {order.status === "received" && (
          <button
            onClick={() => onStatusChange(order._id, "preparing")}
            className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg text-sm active:scale-95 transition-transform"
          >
            Start Preparing
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onStatusChange(order._id, "ready")}
            className="flex-1 bg-green-600 text-white font-medium py-2 rounded-lg text-sm active:scale-95 transition-transform"
          >
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
}
