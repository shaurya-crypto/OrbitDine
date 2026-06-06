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

import { useToast } from "@/components/ui/ToastProvider";

export function AddTableModal({ restaurantId, onClose }: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

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
      toast.success("Table added successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <GlassPanel premium className="w-full max-w-md p-6 relative bg-zinc-900 text-white border border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6">Add New Table</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Table Number/Name</label>
            <input 
              required 
              type="text" 
              value={tableNumber} 
              onChange={e => setTableNumber(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50" 
              placeholder="e.g. 12 or Patio-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Capacity (Optional)</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={e => setCapacity(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50" 
              placeholder="e.g. 4"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? "Adding..." : <><Plus size={18} /> Add Table</>}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
