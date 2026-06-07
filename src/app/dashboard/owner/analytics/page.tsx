"use client";

import { useAuthStore } from "@/stores/authStore";
import { OwnerCards } from "@/components/dashboard/owner/OwnerCards";
import { RevenueCharts } from "@/components/dashboard/owner/RevenueCharts";

export default function AnalyticsPage() {
  const { restaurantId } = useAuthStore();

  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-text-primary mb-1">Business Analytics</h1>
        <p className="text-text-secondary">Real-time overview of your restaurant's performance.</p>
      </div>

      <OwnerCards restaurantId={restaurantId} />
      
      <RevenueCharts restaurantId={restaurantId} />
    </div>
  );
}
