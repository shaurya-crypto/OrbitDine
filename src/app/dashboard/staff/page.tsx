"use client";

import { useAuthStore } from "@/stores/authStore";
import { TableGrid } from "@/components/dashboard/staff/TableGrid";
import { BillRequestPanel } from "@/components/dashboard/staff/BillRequestPanel";
import { ReadyOrdersPanel } from "@/components/dashboard/staff/ReadyOrdersPanel";

import { useState, useEffect } from "react";

export default function StaffPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Floor Staff Dashboard</h1>
        <p className="text-text-secondary">Live table management and requests</p>
      </div>
      
      <div className="flex flex-1 gap-8">
        {/* Main Grid */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Active Tables</h2>
          <TableGrid restaurantId={restaurantId} />
        </div>

        {/* Right Sidebar */}
        <div className="w-96 flex flex-col gap-8 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              Ready to Serve
            </h2>
            <ReadyOrdersPanel restaurantId={restaurantId} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Bill Request Center</h2>
            <BillRequestPanel restaurantId={restaurantId} />
          </div>
        </div>
      </div>
    </div>
  );
}
