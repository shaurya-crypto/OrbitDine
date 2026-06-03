"use client";

import { KitchenBoard } from "@/components/dashboard/kitchen/KitchenBoard";
import { useAuthStore } from "@/stores/authStore";

import { useState, useEffect } from "react";

export default function KitchenPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-8">Loading dashboard...</div>;
  if (!restaurantId) return <div className="p-8 text-red-500">Error: No Restaurant ID linked to your account. Please relogin.</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Kitchen Display System</h1>
        <p className="text-text-secondary">Live order queue</p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KitchenBoard restaurantId={restaurantId} />
      </div>
    </div>
  );
}
