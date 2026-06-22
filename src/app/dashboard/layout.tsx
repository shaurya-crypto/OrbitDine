"use client";

import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { useAuthStore, Role } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { realtimeService, ConnectionState } from "@/services/realtimeService";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw, ShieldAlert, Menu, Search } from "lucide-react";
import { RequestRoleModal } from "@/components/dashboard/layout/RequestRoleModal";
import { NotificationCenter } from "@/components/dashboard/layout/NotificationCenter";
import { CustomNotificationModal } from "@/components/dashboard/CustomNotificationModal";
import { useToast } from "@/components/ui/ToastProvider";
import { Megaphone } from "lucide-react";
import { CommandPalette } from "@/components/dashboard/ui/CommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { roles, restaurantId, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
        if (!silent) toast.error("Session expired. Please log in again.");
        useAuthStore.getState().logout();
        window.location.href = "/login?session_expired=true";
      }
    } catch (e) {
      console.error(e);
    }
    if (!silent) setIsHydratingRole(false);
  };

  useEffect(() => {
    setMounted(true);
    let unsub: (() => void) | undefined;
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
      handleRefreshPermissions(true);
    } else {
      unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
        handleRefreshPermissions(true);
      });
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      if (unsub) unsub();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // WebSocket Subscription Initialization
  useEffect(() => {
    if (isHydrated && roles.length > 0) {
      const unsubscribe = realtimeService.subscribeToState((state) => {
        setConnState(state);
      });

      const userId = useAuthStore.getState().userId;
      if (userId) {
        realtimeService.bindUserEvents(userId, () => {
          handleRefreshPermissions();
        });
      }

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
    if (isHydrated && roles.length === 0) {
      router.replace("/login");
    }
  }, [isHydrated, roles, router]);



  // Role-based access control
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
      hasAccess = true;
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base relative p-4">
          <div className="card p-8 text-center max-w-md w-full">
            <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-page-title text-text-primary mb-2">Access Denied</h1>
            <p className="text-body text-text-secondary mb-6">You do not have the required permissions to view this area.</p>
            
            <button 
              onClick={() => setShowRoleModal(true)}
              className="w-full py-3 bg-accent text-white rounded-xl text-[14px] font-medium hover:bg-accent/90 transition-colors min-h-[44px]"
            >
              Request Access Upgrade
            </button>
            <button 
              onClick={() => handleRefreshPermissions(false)}
              disabled={isHydratingRole}
              className="w-full py-3 mt-3 card text-text-primary text-[14px] font-medium hover:bg-hover transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isHydratingRole ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh Access
            </button>
            <button 
              onClick={() => {
                const highestRole = (["owner", "manager", "staff", "kitchen", "customer"] as Role[]).find(r => roles.includes(r));
                router.push(highestRole ? `/dashboard/${highestRole.toLowerCase()}` : '/');
              }}
              className="w-full py-3 mt-2 text-text-tertiary text-[13px] font-medium hover:text-text-primary transition-colors min-h-[44px]"
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

  // Build breadcrumb from pathname
  const breadcrumbSegments = pathname.split("/").filter(Boolean).slice(1); // Remove "dashboard"
  const breadcrumbLabels: Record<string, string> = {
    owner: "Owner", manager: "Manager", staff: "Floor Staff", kitchen: "Kitchen",
    customer: "Customer", tables: "Tables", analytics: "Analytics", settings: "Settings",
    reviews: "Reviews", backups: "Backups", exports: "Exports", notifications: "Notifications",
    menu: "Menu", "qr-center": "QR Center",
  };

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      {!isCustomerDashboard && (
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[15px] font-semibold text-text-primary tracking-tight">OrbitDine</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Broadcast Message"
            >
              <Megaphone size={18} />
            </button>
            {isMobile && <NotificationCenter />}
          </div>
        </header>
      )}

      {!isCustomerDashboard && <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />}
      
      <div className={`flex-1 flex flex-col min-w-0 ${!isCustomerDashboard ? "md:ml-[280px]" : ""}`}>
        {/* Desktop Topbar */}
        {!isCustomerDashboard && (
          <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-30">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-[13px]" aria-label="Breadcrumb">
              <span className="text-text-tertiary">Dashboard</span>
              {breadcrumbSegments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-text-tertiary">/</span>
                  <span className={i === breadcrumbSegments.length - 1 ? "text-text-primary font-medium" : "text-text-tertiary"}>
                    {breadcrumbLabels[seg] || seg}
                  </span>
                </span>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Sync Status */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium" title={`Status: ${connState}`}>
                {connState === "connected" ? (
                  <><Wifi size={12} className="text-emerald-500" /><span className="text-text-tertiary">Live</span></>
                ) : (
                  <><WifiOff size={12} className="text-text-tertiary" /><span className="text-text-tertiary">Offline</span></>
                )}
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-xl transition-colors"
                title="Broadcast Message"
              >
                <Megaphone size={16} />
              </button>

              <NotificationCenter />
            </div>
          </header>
        )}

        <main className={!isCustomerDashboard ? "p-4 md:p-6" : ""}>
          {(!isHydrated || roles.length === 0) ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <RefreshCw className="animate-spin text-text-tertiary" />
            </div>
          ) : (
            children
          )}
        </main>
        
        {showBroadcastModal && <CustomNotificationModal onClose={() => setShowBroadcastModal(false)} />}
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
