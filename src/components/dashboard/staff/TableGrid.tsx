"use client";

import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { SkeletonCard } from "@/components/dashboard/ui/Skeleton";
import { Users, AlertCircle, Plus } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useState } from "react";
import { AddTableModal } from "@/components/dashboard/manager/AddTableModal";

export function TableGrid({ restaurantId }: { restaurantId: string }) {
  const { data: tables, isLoading } = useRealtimeTables(restaurantId);
  const { selectedTableId, setSelectedTable } = useDashboardStore();
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} lines={2} className="h-24" />)}
      </div>
    );
  }

  const activeTables = tables || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available": 
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:border-emerald-500/40";
      case "ordering": 
        return "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:border-amber-500/40";
      case "preparing": 
        return "bg-orange-500/10 border-orange-500/20 text-orange-500 hover:border-orange-500/40";
      case "bill_requested": 
        return "bg-blue-500/10 border-blue-500/30 text-blue-500 hover:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500 animate-pulse";
      default: 
        return "bg-elevated border-border text-text-secondary hover:border-border-hover";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg text-[12px] font-medium transition-colors"
        >
          <Plus size={14} /> Add Table
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {activeTables.map((table: any) => (
          <button
            key={table._id}
            onClick={() => setSelectedTable(table._id)}
            className={`group flex flex-col p-3.5 rounded-2xl border transition-all duration-200 ease-out active:scale-[0.98] text-left min-h-[96px] overflow-hidden ${
              selectedTableId === table._id ? "ring-2 ring-accent border-transparent" : ""
            } ${getStatusStyle(table.status)}`}
          >
            <div className="flex justify-between items-start mb-3 w-full">
              <span className="text-xl font-bold font-sans tracking-tight leading-none group-hover:scale-105 transition-transform origin-top-left truncate">
                {table.tableNumber}
              </span>
              {table.status === "bill_requested" && <AlertCircle size={16} className="text-blue-500 animate-bounce flex-shrink-0" />}
            </div>
            
            <div className="mt-auto flex justify-between items-end w-full gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">
                {table.status.replace("_", " ")}
              </span>
              <div className="opacity-70">
                <Users size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAddModal && <AddTableModal restaurantId={restaurantId} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
