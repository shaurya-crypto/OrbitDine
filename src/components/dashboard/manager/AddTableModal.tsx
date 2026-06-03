"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface AddTableModalProps {
  restaurantId: string;
  onClose: () => void;
}

export function AddTableModal({ restaurantId, onClose }: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/tables", {
        restaurantId,
        tableNumber,
        capacity: capacity ? parseInt(capacity) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <GlassPanel premium className="w-full max-w-md p-6 relative bg-white text-neutral-900">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6">Add New Table</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Table Number/Name</label>
            <input 
              required 
              type="text" 
              value={tableNumber} 
              onChange={e => setTableNumber(e.target.value)} 
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="e.g. 12 or Patio-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Capacity (Optional)</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={e => setCapacity(e.target.value)} 
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="e.g. 4"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Adding..." : <><Plus size={18} /> Add Table</>}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
