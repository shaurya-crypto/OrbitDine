"use client";

import { useAuthStore } from "@/stores/authStore";
import { KitchenBoard } from "@/components/dashboard/kitchen/KitchenBoard";
import { useState, useEffect } from "react";
import { ChefHat, ListTree } from "lucide-react";

export default function KitchenPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="max-w-full space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
  if (!restaurantId) return <div className="p-6 text-red-400 text-[14px]">Error: No Restaurant ID linked. Please relogin.</div>;

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] md:h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 flex-shrink-0 px-4 sm:px-0">
        <div>
          <h1 className="text-page-title text-text-primary flex items-center gap-2">
            <ChefHat className="text-orange-400" size={24} />
            Kitchen Display
          </h1>
          <p className="text-caption text-text-secondary mt-0.5">Live order ticketing & menu actions</p>
        </div>
        <button 
          onClick={() => window.location.href = "/dashboard/manager/menu"}
          className="flex items-center gap-2 px-4 py-2.5 card text-[13px] font-medium text-text-primary hover:bg-hover transition-colors min-h-[44px]"
        >
          <ListTree size={14} /> Edit Menu
        </button>
      </div>

      {/* Kitchen Board - Full height */}
      <div className="flex-1 overflow-hidden">
        <KitchenBoard restaurantId={restaurantId} />
      </div>
    </div>
  );
}
