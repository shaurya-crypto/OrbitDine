"use client";

import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { Loader } from "@/components/ui/Loader";
import { useState, useRef, useEffect } from "react";
import { Users, AlertCircle, Save, Edit3, X } from "lucide-react";
import axios from "axios";
import { useDashboardStore } from "@/stores/dashboardStore";

import { useToast } from "@/components/ui/ToastProvider";

export function VisualFloorMap({ restaurantId }: { restaurantId: string }) {
  const { data: tables, isLoading, refetch } = useRealtimeTables(restaurantId);
  const { selectedTableId, setSelectedTable } = useDashboardStore();
  
  const [editMode, setEditMode] = useState(false);
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tables && !editMode) {
      const positions: Record<string, { x: number, y: number }> = {};
      tables.forEach((t: any) => {
        positions[t._id] = { x: t.x || 0, y: t.y || 0 };
      });
      setLocalPositions(positions);
    }
  }, [tables, editMode]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader /></div>;

  const activeTables = tables || [];

  const handlePointerDown = (e: React.PointerEvent, tableId: string) => {
    if (!editMode) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingTable(tableId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!editMode || !draggingTable || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 100, e.clientX - rect.left - 50));
    const y = Math.max(0, Math.min(rect.height - 100, e.clientY - rect.top - 50));

    setLocalPositions(prev => ({
      ...prev,
      [draggingTable]: { x, y }
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!editMode || !draggingTable) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDraggingTable(null);
  };

  const savePositions = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(localPositions).map(([id, pos]) => ({ id, x: pos.x, y: pos.y }));
      await axios.patch(`/api/dashboard/manager/tables/positions`, { restaurantId, updates });
      setEditMode(false);
      refetch();
      toast.success("Layout saved");
    } catch (error) {
      toast.error("Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500/10 border-green-500/30 text-green-400";
      case "ordering": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "preparing": return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "bill_requested": return "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse";
      default: return "bg-zinc-800/50 border-zinc-700 text-zinc-400";
    }
  };

  // If no tables, fallback to normal grid or show empty
  if (activeTables.length === 0) return <div className="text-zinc-500 p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">No tables found. Add tables to build your floor map.</div>;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Control Bar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {editMode ? (
          <>
            <button 
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={savePositions}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent/90"
            >
              {isSaving ? <Loader type="spinner" className="w-4 h-4" /> : <Save size={16} />} 
              Save Layout
            </button>
          </>
        ) : (
          <button 
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm hover:bg-zinc-700 shadow-lg"
          >
            <Edit3 size={16} /> Edit Layout
          </button>
        )}
      </div>

      {/* Grid Canvas */}
      <div 
        ref={containerRef}
        className={`w-full h-[600px] bg-zinc-950/50 rounded-xl border-2 ${editMode ? 'border-accent/50 border-dashed' : 'border-zinc-800/50'} relative overflow-hidden`}
        style={{
          backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {activeTables.map((table: any) => {
          const pos = localPositions[table._id] || { x: 0, y: 0 };
          return (
            <div
              key={table._id}
              onPointerDown={(e) => handlePointerDown(e, table._id)}
              onClick={() => !editMode && setSelectedTable(table._id)}
              className={`absolute w-24 h-24 rounded-2xl border-2 backdrop-blur-md transition-all flex flex-col p-3 ${editMode ? 'cursor-grab active:cursor-grabbing hover:ring-2 ring-accent' : 'cursor-pointer hover:scale-105 hover:shadow-xl hover:z-20'} ${
                selectedTableId === table._id && !editMode ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 z-10" : "z-0"
              } ${getStatusColor(table.status)}`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                touchAction: 'none'
              }}
            >
              <div className="flex justify-between items-start mb-1 w-full">
                <span className="font-serif text-2xl font-bold text-white drop-shadow-md">{table.tableNumber}</span>
                {table.status === "bill_requested" && <AlertCircle size={18} className="text-blue-400" />}
              </div>
              
              <div className="mt-auto flex justify-between items-center w-full">
                <div className="flex items-center space-x-1 bg-black/40 px-1.5 py-0.5 rounded text-white border border-white/10">
                  <Users size={10} />
                  <span className="text-[10px] font-bold">{table.capacity || 4}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
