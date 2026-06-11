"use client";

import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { Loader } from "@/components/ui/Loader";
import { Users, AlertCircle, Plus } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useState } from "react";
import { AddTableModal } from "@/components/dashboard/manager/AddTableModal";

export function TableGrid({ restaurantId }: { restaurantId: string }) {
  const { data: tables, isLoading } = useRealtimeTables(restaurantId);
  const { selectedTableId, setSelectedTable } = useDashboardStore();
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) return <div className="flex justify-center p-12"><Loader /></div>;

  const activeTables = tables || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-[#e8f8f0] dark:bg-emerald-900/20 border-[#c2e8d4] dark:border-emerald-800/30 text-[#0f5132] dark:text-emerald-300";
      case "ordering": return "bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-300";
      case "preparing": return "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30 text-orange-800 dark:text-orange-300";
      case "bill_requested": return "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/30 text-blue-900 dark:text-blue-300 shadow-md shadow-blue-500/20 ring-2 ring-blue-500 animate-pulse";
      default: return "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-neutral-900 dark:text-white flex items-center gap-2">
          Active Tables
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Table
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {activeTables.map((table: any) => (
          <button
            key={table._id}
            onClick={() => setSelectedTable(table._id)}
            className={`group flex flex-col p-3 sm:p-4 rounded-3xl border transition-all duration-300 ease-out active:scale-95 hover:shadow-lg hover:-translate-y-1 text-left min-h-[100px] sm:min-h-[120px] ${
              selectedTableId === table._id ? "ring-2 ring-[#0f5132] dark:ring-emerald-400 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900 shadow-md" : "border-transparent"
            } ${getStatusColor(table.status)}`}
          >
            <div className="flex justify-between items-start mb-2 sm:mb-4 w-full">
              <span className="font-serif text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform origin-top-left">{table.tableNumber}</span>
              {table.status === "bill_requested" && <AlertCircle size={20} className="text-blue-600 animate-bounce" />}
            </div>
            
            <div className="mt-auto flex justify-between items-end w-full gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-90 leading-tight">
                {table.status.replace("_", " ")}
              </span>
              <div className="flex items-center space-x-1 opacity-70">
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAddModal && <AddTableModal restaurantId={restaurantId} onClose={() => setShowAddModal(false)} />}
    </>
  );
}
