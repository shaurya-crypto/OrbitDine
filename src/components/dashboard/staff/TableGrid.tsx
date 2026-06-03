"use client";

import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { Loader } from "@/components/ui/Loader";
import { Users, AlertCircle } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";

export function TableGrid({ restaurantId }: { restaurantId: string }) {
  const { data: tables, isLoading } = useRealtimeTables(restaurantId);
  const { selectedTableId, setSelectedTable } = useDashboardStore();

  if (isLoading) return <div className="flex justify-center p-12"><Loader /></div>;

  const activeTables = tables || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 border-green-200 text-green-800";
      case "ordering": return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "preparing": return "bg-orange-100 border-orange-200 text-orange-800";
      case "bill_requested": return "bg-blue-100 border-blue-300 text-blue-900 shadow-md shadow-blue-500/20 ring-2 ring-blue-500 animate-pulse";
      default: return "bg-neutral-100 border-neutral-200 text-neutral-600";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {activeTables.map((table: any) => (
        <button
          key={table._id}
          onClick={() => setSelectedTable(table._id)}
          className={`flex flex-col p-4 rounded-2xl border transition-all active:scale-95 text-left ${
            selectedTableId === table._id ? "ring-2 ring-neutral-900 ring-offset-2" : ""
          } ${getStatusColor(table.status)}`}
        >
          <div className="flex justify-between items-start mb-4 w-full">
            <span className="font-serif text-2xl font-bold">{table.tableNumber}</span>
            {table.status === "bill_requested" && <AlertCircle size={20} className="text-blue-600" />}
          </div>
          
          <div className="mt-auto flex justify-between items-end w-full">
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {table.status.replace("_", " ")}
            </span>
            <div className="flex items-center space-x-1 opacity-70">
              <Users size={14} />
              <span className="text-sm font-medium">{table.capacity}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
