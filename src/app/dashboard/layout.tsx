"use client";

import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { useAuthStore, Role } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { realtimeService, ConnectionState } from "@/services/realtimeService";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw, ShieldAlert, Menu } from "lucide-react";
import { RequestRoleModal } from "@/components/dashboard/layout/RequestRoleModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, restaurantId, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connState, setConnState] = useState<ConnectionState>("offline");
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // WebSocket Subscription Initialization
  useEffect(() => {
    if (mounted && role && restaurantId) {
      // 1. Subscribe to connection state changes
      const unsubscribe = realtimeService.subscribeToState((state) => {
        setConnState(state);
      });

      // 2. Bind all dashboard events to QueryClient invalidations
      realtimeService.bindDashboardEvents(restaurantId, role, queryClient);

      return () => {
        unsubscribe();
        realtimeService.unbindDashboardEvents(restaurantId, role);
      };
    }
  }, [mounted, role, restaurantId, queryClient]);

  // Redirect to login if no role is set
  if (mounted && !role) {
    router.replace("/login");
    return <div className="min-h-screen bg-surface" />;
  }

  // Basic Role Verification Check (client side for MVP)
  if (mounted && role) {
    const isKitchenArea = pathname.includes("/kitchen");
    const isStaffArea = pathname.includes("/staff");
    const isManagerArea = pathname.includes("/manager");
    const isOwnerArea = pathname.includes("/owner");

    const normalizedRole = role.toLowerCase();

    if (
      (isKitchenArea && !["kitchen", "staff", "manager", "owner"].includes(normalizedRole)) ||
      (isStaffArea && !["staff", "manager", "owner"].includes(normalizedRole)) ||
      (isManagerArea && !["manager", "owner"].includes(normalizedRole)) ||
      (isOwnerArea && normalizedRole !== "owner")
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface relative">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-neutral-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-2xl font-serif text-neutral-900 mb-2">Access Denied</h1>
            <p className="text-neutral-500 mb-8">You do not have the required permissions to view this area.</p>
            
            <button 
              onClick={() => setShowRoleModal(true)}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
            >
              Request Access Upgrade
            </button>
            <button 
              onClick={() => router.push(role ? `/dashboard/${role.toLowerCase()}` : '/')}
              className="w-full py-3 mt-3 text-neutral-500 font-medium hover:text-neutral-900 transition-colors"
            >
              Return to My Dashboard
            </button>
          </div>
          {showRoleModal && <RequestRoleModal onClose={() => setShowRoleModal(false)} />}
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-40">
        <h1 className="text-xl font-serif text-text-primary">OrbitDine</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-text-secondary hover:bg-border/30 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen relative w-full overflow-x-hidden">
        {/* Connection Status Indicator */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
          {connState === "connected" && (
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 text-xs font-semibold shadow-sm">
              <Wifi size={14} />
              <span>Live</span>
            </div>
          )}
          {connState === "reconnecting" && (
            <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-200 text-xs font-semibold shadow-sm">
              <RefreshCw size={14} className="animate-spin" />
              <span>Connecting</span>
            </div>
          )}
          {connState === "offline" && (
            <div className="hidden md:flex items-center space-x-2 bg-surface text-text-secondary px-3 py-1.5 rounded-full border border-border text-xs font-medium shadow-sm">
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Polling Sync</span>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
