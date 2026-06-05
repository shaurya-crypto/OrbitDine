"use client";

import { useAuthStore } from "@/stores/authStore";
import { ManagerCards } from "@/components/dashboard/manager/ManagerCards";
import { VisualFloorMap } from "@/components/dashboard/manager/VisualFloorMap";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { MenuControlPanel } from "@/components/dashboard/manager/MenuControlPanel";
import { useDashboardStore } from "@/stores/dashboardStore";
import { AddTableModal } from "@/components/dashboard/manager/AddTableModal";
import { MenuManagementModal } from "@/components/dashboard/manager/MenuManagementModal";

import { useState, useEffect } from "react";
import { Plus, Settings2, Grid, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8 bg-zinc-950 min-h-screen text-white">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 bg-zinc-950 min-h-screen text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1 text-white">Manager Dashboard</h1>
            <p className="text-zinc-400 text-sm">Full operations overview</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddTable(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Plus size={16} /> Add Table
            </button>
            <button 
              onClick={() => router.push("/dashboard/manager/qr-center")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <QrCode size={16} /> QR Center
            </button>
            <button 
              onClick={() => router.push("/dashboard/manager/menu")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              <Settings2 size={16} /> Menu Console
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <ManagerCards restaurantId={restaurantId} />

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Floor Map & Tables */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Grid className="text-emerald-400 w-5 h-5" />
              <h2 className="text-xl font-serif text-white">Floor Map</h2>
            </div>
            {/* Note: We will add Edit/Disable Table and Generate/Print QR actions to the Table components later as specified by the prompt */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden min-h-[400px]">
               <VisualFloorMap restaurantId={restaurantId} />
            </div>
          </div>

          {/* Right Sidebar (Menu Quick Controls) */}
          <div className="w-full lg:w-80 flex-shrink-0">
             <div className="flex items-center gap-2 mb-6">
              <Settings2 className="text-indigo-400 w-5 h-5" />
              <h2 className="text-xl font-serif text-white">Quick Controls</h2>
            </div>
            <MenuControlPanel restaurantId={restaurantId} />
          </div>
        </div>
      </div>

      {selectedTableId && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => useDashboardStore.getState().setSelectedTable(null)} />
          <SessionDrawer restaurantId={restaurantId} />
        </>
      )}

      {showAddTable && <AddTableModal restaurantId={restaurantId} onClose={() => setShowAddTable(false)} />}
    </div>
  );
}
