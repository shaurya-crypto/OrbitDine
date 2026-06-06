"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";
import { Plus, Trash2, LayoutGrid, Users } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface Table {
  _id: string;
  tableNumber: string;
  capacity?: number;
  floor?: string;
  status: string;
}

export default function TableManagementPage() {
  const { restaurantId } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: 4, floor: "Main Floor" });
  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (restaurantId) fetchTables();
  }, [restaurantId]);

  const fetchTables = async () => {
    try {
      const res = await fetch(`/api/restaurant/tables?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    if (!newTable.tableNumber) return;
    try {
      const res = await fetch(`/api/restaurant/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, ...newTable })
      });
      if (res.ok) {
        const data = await res.json();
        setTables([...tables, data.table]);
        setNewTable({ ...newTable, tableNumber: "" });
        toast.success("Table added successfully");
      } else {
        toast.error("Failed to add table. Check if table number exists.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to add table");
    }
  };

  const handleDelete = async (tableId: string) => {
    const ok = await confirm({ title: "Delete Table", message: "Are you sure you want to delete this table?", isDanger: true });
    if (!ok) return;
    try {
      const res = await fetch(`/api/restaurant/tables?tableId=${tableId}`, { method: "DELETE" });
      if (res.ok) {
        setTables(tables.filter(t => t._id !== tableId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900 mb-1">Table Management</h1>
        <p className="text-neutral-500">Configure physical tables, capacity, and layout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GlassPanel className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-900"><LayoutGrid size={18} /> Add New Table</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Table Number/Name</label>
                <input 
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  placeholder="e.g. 12 or Patio-1"
                  className="w-full p-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Capacity (Seats)</label>
                <input 
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Floor / Area</label>
                <input 
                  value={newTable.floor}
                  onChange={(e) => setNewTable({ ...newTable, floor: e.target.value })}
                  placeholder="e.g. Main Floor"
                  className="w-full p-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <button 
                onClick={handleAddTable}
                className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Table
              </button>
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map(table => (
              <GlassPanel key={table._id} className="p-4 flex flex-col justify-between border-neutral-200 hover:border-neutral-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif text-neutral-900 leading-none">{table.tableNumber}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{table.floor}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    table.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {table.status}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-neutral-100 pt-3 mt-auto">
                  <div className="flex items-center gap-1 text-neutral-500 text-sm">
                    <Users size={14} /> {table.capacity}
                  </div>
                  <button onClick={() => handleDelete(table._id)} className="text-neutral-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassPanel>
            ))}
            {tables.length === 0 && (
              <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed border-neutral-200 rounded-2xl">
                No tables configured yet. Add your first table on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
