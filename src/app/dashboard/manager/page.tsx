"use client";

import { useAuthStore } from "@/stores/authStore";
import { ManagerCards } from "@/components/dashboard/manager/ManagerCards";
import { KitchenPerformance } from "@/components/dashboard/manager/KitchenPerformance";
import { RevenueCharts } from "@/components/dashboard/owner/RevenueCharts";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { useDashboardStore } from "@/stores/dashboardStore";
import { QuickActions } from "@/components/dashboard/ui/QuickActions";
import { SectionHeader } from "@/components/dashboard/ui/SectionHeader";

import { useState, useEffect } from "react";
import { Users, Settings, Grid, QrCode, Settings2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {
  const { restaurantId } = useAuthStore();
  const { selectedTableId } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    </div>
  );
  if (!restaurantId) return <div className="p-6 text-red-400 text-[14px]">Error: No Restaurant ID linked. Please relogin.</div>;

  const quickActions = [
    { label: "Staff Management", icon: <Users size={16} />, onClick: () => router.push("/dashboard/manager/staff") },
    { label: "Table Management", icon: <Grid size={16} />, onClick: () => router.push("/dashboard/tables") },
    { label: "Analytics", icon: <TrendingUp size={16} />, onClick: () => router.push("/dashboard/manager/analytics")},
    { label: "QR Center", icon: <QrCode size={16} />, onClick: () => router.push("/dashboard/manager/qr-center") },
    { label: "Settings", icon: <Settings size={16} />, onClick: () => router.push("/dashboard/manager/settings") },
    { label: "Menu Console", icon: <Settings2 size={16} />, onClick: () => router.push("/dashboard/manager/menu"), variant: "accent" as const },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-page-title text-text-primary">Operations Center</h1>
          <p className="text-caption text-text-secondary mt-0.5">Live operations overview</p>
        </div>
        <QuickActions actions={quickActions} label="Quick Actions" />
      </div>

      {/* KPI Cards */}
      <ManagerCards restaurantId={restaurantId} />

      {/* Kitchen Operations Section (Phase 4 BI) */}
      <KitchenPerformance restaurantId={restaurantId} />

      {/* Analytics Section */}
      <div>
        <SectionHeader 
          title="Performance" 
          subtitle="Today's revenue and trends"
          className="mb-4"
        />
        <RevenueCharts restaurantId={restaurantId} />
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
