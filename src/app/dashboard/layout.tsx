"use client";

import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { useAuthStore, Role } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { realtimeService, ConnectionState } from "@/services/realtimeService";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw, ShieldAlert, Menu } from "lucide-react";
import { RequestRoleModal } from "@/components/dashboard/layout/RequestRoleModal";
import { NotificationCenter } from "@/components/dashboard/layout/NotificationCenter";
import { CustomNotificationModal } from "@/components/dashboard/CustomNotificationModal";
import { useToast } from "@/components/ui/ToastProvider";
import { Megaphone } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { roles, restaurantId, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connState, setConnState] = useState<ConnectionState>("offline");
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [isHydrated, setIsHydrated] = useState(false);

  const [isHydratingRole, setIsHydratingRole] = useState(false);

  const handleRefreshPermissions = async (silent = false) => {
    if (!silent) setIsHydratingRole(true);
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAuth(data.userId, data.roles, data.restaurantId, data.fullName);
        if (!silent) {
          const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => data.roles.includes(r));
          window.location.href = `/dashboard/${highestRole || "customer"}`;
        }
      } else {
        if (!silent) toast.error("Failed to refresh permissions. Please log out and back in.");
      }
    } catch (e) {
      console.error(e);
    }
    if (!silent) setIsHydratingRole(false);
  };

  useEffect(() => {
    setMounted(true);
    // Check if Zustand has already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
      handleRefreshPermissions(true);
    } else {
      // Subscribe to hydration finish event
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
        handleRefreshPermissions(true);
      });
      return () => { if (unsub) unsub(); };
    }
  }, []);

  // WebSocket Subscription Initialization
  useEffect(() => {
    if (isHydrated && roles.length > 0) {
      // 1. Subscribe to connection state changes
      const unsubscribe = realtimeService.subscribeToState((state) => {
        setConnState(state);
      });

      // 2. Bind user specific events for role updates
      const userId = useAuthStore.getState().userId;
      if (userId) {
        realtimeService.bindUserEvents(userId, () => {
          handleRefreshPermissions(); // Auto refresh when server triggers a role update!
        });
      }

      // 3. Bind all dashboard events to QueryClient invalidations if they belong to a restaurant
      const primaryRole = (["owner", "manager", "staff", "kitchen", "customer"] as Role[]).find(r => roles.includes(r)) || "customer";
      if (restaurantId) {
        realtimeService.bindDashboardEvents(restaurantId, primaryRole as any, queryClient);
      }

      return () => {
        unsubscribe();
        if (userId) realtimeService.unbindUserEvents(userId);
        if (restaurantId) realtimeService.unbindDashboardEvents(restaurantId, primaryRole as any);
      };
    }
  }, [isHydrated, roles, restaurantId, queryClient]);

  useEffect(() => {
    // Redirect to login if no role is set AFTER hydration is complete
    if (isHydrated && roles.length === 0) {
      router.replace("/login");
    }
  }, [isHydrated, roles, router]);

  if (!isHydrated || roles.length === 0) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><RefreshCw className="animate-spin text-neutral-400" /></div>;
  }

  // Basic Role Verification Check (client side for MVP)
  if (isHydrated && roles.length > 0) {
    const isKitchenArea = pathname.includes("/kitchen");
    const isStaffArea = pathname.includes("/staff");
    const isManagerArea = pathname.includes("/manager");
    const isOwnerArea = pathname.includes("/owner");
    const isTablesArea = pathname.includes("/tables");

    let hasAccess = false;
    
    if (isOwnerArea) {
      hasAccess = roles.includes("owner");
    } else if (isManagerArea) {
      hasAccess = roles.includes("owner") || roles.includes("manager");
    } else if (isStaffArea) {
      hasAccess = roles.includes("owner") || roles.includes("manager") || roles.includes("staff");
    } else if (isKitchenArea) {
      hasAccess = roles.includes("owner") || roles.includes("manager") || roles.includes("kitchen");
    } else if (isTablesArea) {
      hasAccess = roles.includes("owner") || roles.includes("manager") || roles.includes("staff");
    } else {
      hasAccess = true; // /dashboard home
    }

    if (!hasAccess) {
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
              onClick={() => handleRefreshPermissions(false)}
              disabled={isHydratingRole}
              className="w-full py-3 mt-3 bg-neutral-100 text-neutral-900 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              {isHydratingRole ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Refresh Access Permissions
            </button>
            <button 
              onClick={() => {
                const highestRole = (["owner", "manager", "staff", "kitchen", "customer"] as Role[]).find(r => roles.includes(r));
                router.push(highestRole ? `/dashboard/${highestRole.toLowerCase()}` : '/');
              }}
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

  const isCustomerDashboard = pathname.startsWith("/dashboard/customer");

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      {!isCustomerDashboard && (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-40">
          <h1 className="text-xl font-serif text-text-primary">OrbitDine</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-border/30 rounded-lg transition-colors"
              title="Broadcast Message"
            >
              <Megaphone size={20} />
            </button>
            <NotificationCenter />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 ml-2 text-text-secondary hover:bg-border/30 rounded-lg">
              <Menu size={24} />
            </button>
          </div>
        </div>
      )}

      {!isCustomerDashboard && <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />}
      
      <div className={`flex-1 ${!isCustomerDashboard ? "md:ml-64 p-4 md:p-8" : ""} min-h-screen relative w-full overflow-x-hidden`}>
        {/* Top Right Controls: Connection & Notifications (Desktop Only, mobile moved to header) */}
        {!isCustomerDashboard && (
          <div className="hidden md:flex absolute top-8 right-8 z-50 items-center gap-4">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-base rounded-xl transition-colors bg-surface border border-border shadow-sm"
              title="Broadcast Message"
            >
              <Megaphone size={20} />
            </button>
            <div className="bg-surface border border-border shadow-sm rounded-xl">
              <NotificationCenter />
            </div>
          </div>
        )}

        {children}
        {showBroadcastModal && <CustomNotificationModal onClose={() => setShowBroadcastModal(false)} />}
      </div>
    </div>
  );
}
