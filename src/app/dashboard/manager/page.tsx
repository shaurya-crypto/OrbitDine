"use client";

import { useAuthStore } from "@/stores/authStore";
import { OverviewCards } from "@/components/dashboard/manager/OverviewCards";
import { TableGrid } from "@/components/dashboard/staff/TableGrid";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { MenuControlPanel } from "@/components/dashboard/manager/MenuControlPanel";
import { useDashboardStore } from "@/stores/dashboardStore";
import { AddTableModal } from "@/components/dashboard/manager/AddTableModal";
import { MenuManagementModal } from "@/components/dashboard/manager/MenuManagementModal";

import { useState, useEffect } from "react";

export default function ManagerPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Manager Dashboard</h1>
          <p className="text-text-secondary">Full operations overview</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddTable(true)}
            className="px-4 py-2 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-50"
          >
            + Add Table
          </button>
          <button 
            onClick={() => setShowMenuManagement(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
          >
            Menu Management Console
          </button>
        </div>
      </div>

      <div className="mb-8">
        <OverviewCards restaurantId={restaurantId} />
      </div>
      
      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Floor Map</h2>
          <TableGrid restaurantId={restaurantId} />
        </div>

        <div className="w-80 flex-shrink-0">
          <MenuControlPanel restaurantId={restaurantId} />
        </div>
      </div>

      {selectedTableId && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => useDashboardStore.getState().setSelectedTable(null)} />
          <SessionDrawer restaurantId={restaurantId} />
        </>
      )}

      {showAddTable && <AddTableModal restaurantId={restaurantId} onClose={() => setShowAddTable(false)} />}
      {showMenuManagement && <MenuManagementModal restaurantId={restaurantId} onClose={() => setShowMenuManagement(false)} />}
    </div>
  );
}
