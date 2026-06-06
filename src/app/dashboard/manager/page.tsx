"use client";

import { useAuthStore } from "@/stores/authStore";
import { ManagerCards } from "@/components/dashboard/manager/ManagerCards";
import { ManagerAnalytics } from "@/components/dashboard/manager/ManagerAnalytics";

import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { MenuControlPanel } from "@/components/dashboard/manager/MenuControlPanel";
import { useDashboardStore } from "@/stores/dashboardStore";
import { MenuManagementModal } from "@/components/dashboard/manager/MenuManagementModal";

import { useState, useEffect } from "react";
import { Plus, Settings2, Grid, QrCode, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
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
              onClick={() => router.push("/dashboard/manager/staff")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Users size={16} /> Staff
            </button>
            <button 
              onClick={() => router.push("/dashboard/manager/settings")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Settings size={16} /> Settings
            </button>
            <button 
              onClick={() => router.push("/dashboard/tables")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Grid size={16} /> Table Management
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

        <ManagerAnalytics restaurantId={restaurantId} />

        {/* Main Content Grid */}
        <div className="flex justify-center">
          {/* Menu Quick Controls */}
          <div className="w-full max-w-4xl">
             <div className="flex items-center gap-2 mb-6">
              <Settings2 className="text-indigo-400 w-5 h-5" />
              <h2 className="text-xl font-serif text-white">Menu Controls</h2>
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
    </div>
  );
}
