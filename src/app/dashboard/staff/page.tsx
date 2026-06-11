"use client";

import { useAuthStore } from "@/stores/authStore";
import { TableGrid } from "@/components/dashboard/staff/TableGrid";
import { BillRequestPanel } from "@/components/dashboard/staff/BillRequestPanel";
import { ReadyOrdersPanel } from "@/components/dashboard/staff/ReadyOrdersPanel";
import { StaffCards } from "@/components/dashboard/staff/StaffCards";
import { useDashboardStore } from "@/stores/dashboardStore";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";

import { useState, useEffect } from "react";
import { Utensils, Grid, ListTree } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8 bg-base min-h-screen text-text-primary">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="min-h-screen bg-base text-text-primary p-6 md:p-8 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1 text-text-primary">Floor Staff Dashboard</h1>
            <p className="text-text-secondary text-sm">Live table management and service requests</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button 
              onClick={() => router.push("/dashboard/manager/menu")}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ListTree size={16} /> Edit Menu
            </button>
            <button 
              onClick={() => router.push("/dashboard/tables")}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Grid size={16} /> Table Management
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <StaffCards restaurantId={restaurantId} />
        
        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row flex-1 gap-8">
          
          {/* Active Tables Floor */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="text-emerald-400 w-5 h-5" />
              <h2 className="text-xl font-serif text-text-primary">Active Tables</h2>
            </div>
            {/* Staff actions: Mark Served, Generate Bill, Close Session, Print QR can be invoked by clicking the table and using SessionDrawer. */}
            <div className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden min-h-[400px]">
              <TableGrid restaurantId={restaurantId} />
            </div>
          </div>

          {/* Right Sidebar: Ready Orders & Bills */}
          <div className="w-full lg:w-96 flex flex-col gap-8 flex-shrink-0">
            <div>
              <h2 className="text-lg font-serif text-text-primary mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Ready to Serve
              </h2>
              <ReadyOrdersPanel restaurantId={restaurantId} />
            </div>

            <div>
              <h2 className="text-lg font-serif text-text-primary mb-4">Bill Request Center</h2>
              <BillRequestPanel restaurantId={restaurantId} />
            </div>
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
