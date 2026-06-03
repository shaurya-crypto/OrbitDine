"use client";

import { useAuthStore } from "@/stores/authStore";
import { OverviewCards } from "@/components/dashboard/manager/OverviewCards";
import { RevenueCharts } from "@/components/dashboard/owner/RevenueCharts";
import { RoleRequestsPanel } from "@/components/dashboard/owner/RoleRequestsPanel";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRealtimeOverview } from "@/hooks/useRealtimeOverview";

export default function OwnerPage() {
  const { restaurantId } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: overview } = useRealtimeOverview(restaurantId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/signup?restaurantId=${restaurantId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Owner Analytics</h1>
          <p className="text-text-secondary">Macro financial performance</p>
        </div>
        <button 
          onClick={handleCopyInvite}
          className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
        >
          {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
          {copied ? "Link Copied!" : "Copy Staff Invite Link"}
        </button>
      </div>

      <RoleRequestsPanel restaurantId={restaurantId} />

      <div className="mb-8">
        <OverviewCards restaurantId={restaurantId} />
      </div>

      <div className="flex-1">
        <RevenueCharts restaurantId={restaurantId} />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-text-primary mb-4">Top Selling Items</h3>
            <ul className="space-y-3">
              {overview?.topSellingItems?.length > 0 ? (
                overview.topSellingItems.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="font-medium text-text-primary">{item.quantity} Orders</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-text-secondary">No data available</li>
              )}
            </ul>
          </div>
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-text-primary mb-4">Peak Operational Hours</h3>
            <ul className="space-y-3">
              {overview?.peakHours?.length > 0 ? (
                overview.peakHours.map((ph: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{ph.hour.toString().padStart(2, '0')}:00 - {(ph.hour + 1).toString().padStart(2, '0')}:00</span>
                    <span className="font-medium text-text-primary">{ph.orders} Orders</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-text-secondary">No data available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
