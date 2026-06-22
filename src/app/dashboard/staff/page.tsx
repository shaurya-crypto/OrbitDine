"use client";

import { useAuthStore } from "@/stores/authStore";
import { TableGrid } from "@/components/dashboard/staff/TableGrid";
import { BillRequestPanel } from "@/components/dashboard/staff/BillRequestPanel";
import { ReadyOrdersPanel } from "@/components/dashboard/staff/ReadyOrdersPanel";
import { StaffCards } from "@/components/dashboard/staff/StaffCards";
import { useDashboardStore } from "@/stores/dashboardStore";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { SectionHeader } from "@/components/dashboard/ui/SectionHeader";

import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";

export default function StaffPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
    </div>
  );
  if (!restaurantId) return <div className="p-6 text-red-400 text-[14px]">Error: No Restaurant ID linked. Please relogin.</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-text-primary">Floor Staff</h1>
        <p className="text-caption text-text-secondary mt-0.5">Live table management and service requests</p>
      </div>

      {/* KPI Cards */}
      <StaffCards restaurantId={restaurantId} />
      
      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Active Tables */}
        <div className="flex-1 min-w-0">
          <SectionHeader title="Active Tables" className="mb-3" />
          <div className="card p-4 min-h-[300px]">
            <TableGrid restaurantId={restaurantId} />
          </div>
        </div>

        {/* Right Panel: Ready Orders & Bills */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 flex-shrink-0">
          <div>
            <SectionHeader 
              title="Ready to Serve" 
              subtitle="Tap to mark delivered"
              className="mb-3"
            />
            <ReadyOrdersPanel restaurantId={restaurantId} />
          </div>

          <div>
            <SectionHeader title="Bill Requests" className="mb-3" />
            <BillRequestPanel restaurantId={restaurantId} />
          </div>
        </div>
      </div>

      {/* Session Drawer */}
      {selectedTableId && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => useDashboardStore.getState().setSelectedTable(null)} />
          <SessionDrawer restaurantId={restaurantId} />
        </>
      )}
    </div>
  );
}
