"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 relative bg-white text-neutral-900 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-neutral-900 font-serif">Add New Table</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Table Number/Name</label>
            <input 
              required 
              type="text" 
              value={tableNumber} 
              onChange={e => setTableNumber(e.target.value)} 
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
              placeholder="e.g. 12 or Patio-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Capacity (Optional)</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={e => setCapacity(e.target.value)} 
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
              placeholder="e.g. 4"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
          >
            {loading ? "Adding..." : <><Plus size={18} /> Add Table</>}
          </button>
        </form>
      </div>
    </div>
  );
}
