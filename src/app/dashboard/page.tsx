"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, Role } from "@/stores/authStore";

export default function DashboardRootPage() {
  const router = useRouter();
  const { roles } = useAuthStore();

  useEffect(() => {
    if (roles && roles.length > 0) {
      const highestRole = (["owner", "manager", "staff", "kitchen", "customer"] as Role[]).find(r => roles.includes(r)) || "customer";
      router.replace(`/dashboard/${highestRole}`);
    }
  }, [roles, router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-neutral-500 animate-pulse">Redirecting to your dashboard...</p>
    </div>
  );
}
