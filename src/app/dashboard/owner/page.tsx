"use client";

import { useAuthStore } from "@/stores/authStore";
import { OwnerCards } from "@/components/dashboard/owner/OwnerCards";
import { RoleRequestsPanel } from "@/components/dashboard/owner/RoleRequestsPanel";
import { Users, Settings, Grid, QrCode, LineChart } from "lucide-react";
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

  if (!mounted) return <div className="p-8 bg-base min-h-screen text-text-primary">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  const sections = [
    { title: "Staff Management", icon: <Users size={24} className="text-blue-500" />, href: "/dashboard/manager/staff" },
    { title: "Restaurant Settings", icon: <Settings size={24} className="text-zinc-500" />, href: "/dashboard/manager/settings" },
    { title: "Table Management", icon: <Grid size={24} className="text-emerald-500" />, href: "/dashboard/tables" },
    { title: "QR Management", icon: <QrCode size={24} className="text-purple-500" />, href: "/dashboard/manager/qr-center" },
    { title: "Full Analytics Center", icon: <LineChart size={24} className="text-indigo-500" />, href: "/dashboard/owner/analytics" },
  ];

  return (
    <div className="min-h-screen bg-base text-text-primary p-4 md:p-8 overflow-y-auto">
      <InviteLinkModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        restaurantId={restaurantId} 
      />
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1">Operational Command</h1>
            <p className="text-text-secondary text-sm">Real-time status overview</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/dashboard/owner/analytics"
              className="px-5 py-2.5 bg-surface border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              <LineChart size={16} className="text-indigo-500" />
              Open Analytics
            </Link>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={16} />
              Invite Staff
            </button>
          </div>
        </div>

        {/* Top KPI Cards (7 Metrics) */}
        <OwnerCards restaurantId={restaurantId} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Panels */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden">
               <h3 className="font-serif text-xl mb-4">Pending Staff Approvals</h3>
               <RoleRequestsPanel restaurantId={restaurantId} />
            </div>
            
            <div className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[150px] text-center">
               <LineChart size={32} className="text-text-secondary mb-3 opacity-50" />
               <p className="text-text-secondary text-sm mb-4">Deep analytics and charts have been moved to the Full Analytics Center.</p>
               <Link href="/dashboard/owner/analytics" className="text-accent text-sm font-medium hover:underline">Go to Analytics ➔</Link>
            </div>
          </div>

          {/* Right Column: Navigation & Modules */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-xl mb-2">Management Modules</h3>
            {sections.map((section, idx) => (
              <Link 
                key={idx} 
                href={section.href}
                className="group flex items-center p-4 bg-surface border border-border rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{section.title}</h4>
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
