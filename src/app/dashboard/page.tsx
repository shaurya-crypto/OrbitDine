"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardRootPage() {
  const router = useRouter();
  const { role } = useAuthStore();

  useEffect(() => {
    if (role) {
      router.replace(`/dashboard/${role.toLowerCase()}`);
    } else {
      // It will let layout.tsx handle the "Select Environment" prompt if no role
    }
  }, [role, router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-neutral-500 animate-pulse">Redirecting to your dashboard...</p>
    </div>
  );
}
