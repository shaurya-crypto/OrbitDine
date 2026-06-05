"use client";

import { useAuthStore } from "@/stores/authStore";
import { OwnerCards } from "@/components/dashboard/owner/OwnerCards";
import { RevenueCharts } from "@/components/dashboard/owner/RevenueCharts";
import { RoleRequestsPanel } from "@/components/dashboard/owner/RoleRequestsPanel";
import { Copy, CheckCircle2, Users, Settings, Grid, QrCode, LineChart } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function OwnerPage() {
  const { restaurantId } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 bg-zinc-950 min-h-screen text-white">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 bg-zinc-950 min-h-screen text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/signup?restaurantId=${restaurantId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { title: "Staff Management", icon: <Users size={24} className="text-blue-400" />, href: "/dashboard/owner/staff" },
    { title: "Restaurant Settings", icon: <Settings size={24} className="text-zinc-400" />, href: "/dashboard/owner/settings" },
    { title: "Table Management", icon: <Grid size={24} className="text-emerald-400" />, href: "/dashboard/manager/tables" },
    { title: "QR Management", icon: <QrCode size={24} className="text-purple-400" />, href: "/dashboard/manager/qr-center" },
    { title: "Full Analytics", icon: <LineChart size={24} className="text-indigo-400" />, href: "/dashboard/owner/analytics" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1 text-white">Owner Dashboard</h1>
            <p className="text-zinc-400 text-sm">Real-time operational overview</p>
          </div>
          <button 
            onClick={handleCopyInvite}
            className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
            {copied ? "Link Copied!" : "Copy Staff Invite Link"}
          </button>
        </div>

        {/* Top KPI Cards */}
        <OwnerCards restaurantId={restaurantId} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts & Analytics */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
               <h3 className="font-serif text-xl text-white mb-6">Revenue Trend</h3>
               <RevenueCharts restaurantId={restaurantId} />
            </div>
            
            <RoleRequestsPanel restaurantId={restaurantId} />
          </div>

          {/* Right Column: Navigation & Sections */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-xl text-white mb-2">Management Modules</h3>
            {sections.map((section, idx) => (
              <Link 
                key={idx} 
                href={section.href}
                className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center mr-4 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{section.title}</h4>
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
