"use client";

import { useAuthStore } from "@/stores/authStore";
import { TableGrid } from "@/components/dashboard/staff/TableGrid";
import { SessionDrawer } from "@/components/dashboard/manager/SessionDrawer";
import { useEffect, useState } from "react";

export default function TableManagementPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !restaurantId) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900 dark:text-white mb-1">Table Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Manage your active dining tables, capacities, and sessions.</p>
      </div>

      <div className="mt-8">
        <TableGrid restaurantId={restaurantId} />
      </div>

      <SessionDrawer restaurantId={restaurantId} />
    </div>
  );
}
