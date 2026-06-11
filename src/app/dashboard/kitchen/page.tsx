"use client";

import { useAuthStore } from "@/stores/authStore";
import { KitchenBoard } from "@/components/dashboard/kitchen/KitchenBoard";
import { useState, useEffect } from "react";
import { ChefHat, ListTree } from "lucide-react";

export default function KitchenPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8 bg-base min-h-screen text-text-primary">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="min-h-screen bg-base text-text-primary p-6 md:p-8 overflow-hidden flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight mb-1 flex items-center gap-3 text-text-primary">
            <ChefHat className="text-orange-400" size={32} />
            Kitchen Display System
          </h1>
          <p className="text-text-secondary text-sm">Live order ticketing & Menu Actions</p>
        </div>
        <button 
          onClick={() => window.location.href = "/dashboard/manager/menu"}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ListTree size={16} /> Edit Menu
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KitchenBoard restaurantId={restaurantId} />
      </div>
    </div>
  );
}
