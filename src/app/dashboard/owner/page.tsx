"use client";

import { useAuthStore } from "@/stores/authStore";
import { OwnerCards } from "@/components/dashboard/owner/OwnerCards";
import { RoleRequestsPanel } from "@/components/dashboard/owner/RoleRequestsPanel";
import { SectionHeader } from "@/components/dashboard/ui/SectionHeader";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
import { Users, Settings, Grid, QrCode, LineChart, Star, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InviteLinkModal } from "@/components/dashboard/owner/InviteLinkModal";

export default function OwnerPage() {
  const { restaurantId } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="skeleton h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    </div>
  );
  if (!restaurantId) return <div className="p-6 text-red-400 text-[14px]">Error: No Restaurant ID linked. Please relogin.</div>;

  const modules = [
    { title: "Staff", icon: <Users size={18} className="text-blue-400" />, href: "/dashboard/manager/staff" },
    { title: "Settings", icon: <Settings size={18} className="text-text-secondary" />, href: "/dashboard/manager/settings" },
    { title: "Tables", icon: <Grid size={18} className="text-emerald-400" />, href: "/dashboard/tables" },
    { title: "QR Codes", icon: <QrCode size={18} className="text-purple-400" />, href: "/dashboard/manager/qr-center" },
    { title: "Reviews", icon: <Star size={18} className="text-yellow-400" />, href: "/dashboard/owner/reviews" },
    { title: "Analytics", icon: <LineChart size={18} className="text-indigo-400" />, href: "/dashboard/owner/analytics" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <InviteLinkModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        restaurantId={restaurantId} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-page-title text-text-primary">Command Center</h1>
          <p className="text-caption text-text-secondary mt-0.5">Real-time status overview</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/owner/analytics"
            className="flex items-center gap-2 px-4 py-2.5 card text-[13px] font-medium text-text-primary hover:bg-hover transition-colors min-h-[44px]"
          >
            <LineChart size={14} className="text-indigo-400" />
            Analytics
          </Link>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-2xl text-[13px] font-medium hover:bg-accent/90 transition-colors min-h-[44px]"
          >
            <Users size={14} />
            Invite Staff
          </button>
        </div>
      </div>

      {/* KPI Cards — Operations First */}
      <OwnerCards restaurantId={restaurantId} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Staff Approvals */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <SectionHeader title="Pending Staff Approvals" className="mb-4" />
            <RoleRequestsPanel restaurantId={restaurantId} />
          </div>
        </div>

        {/* Right: Quick Modules */}
        <div>
          <SectionHeader title="Quick Access" className="mb-3" />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {modules.map((mod, idx) => (
              <Link 
                key={idx} 
                href={mod.href}
                className="card px-4 py-3 flex items-center gap-3 hover:bg-hover transition-colors group min-h-[44px]"
              >
                <span className="w-8 h-8 rounded-xl bg-text-primary/5 flex items-center justify-center flex-shrink-0">
                  {mod.icon}
                </span>
                <span className="text-[13px] font-medium text-text-primary flex-1">{mod.title}</span>
                <ChevronRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
