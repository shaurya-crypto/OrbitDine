"use client";

import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/ToastProvider";

export function useLogout() {
  const { confirm } = useConfirm();
  const { logout: clearAuthStore } = useAuthStore();
  const toast = useToast();

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      confirmText: "Sign Out",
    });

    if (!ok) return;

    try {
      // Hit the API to clear the HTTP-only cookies
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Failed to hit logout endpoint", err);
    }

    // Clear the client-side zustand store
    clearAuthStore();

    // Show a toast message
    toast.success("Logged out successfully");

    // Fix the back-button bfcache issue:
    // By using window.location.replace, we overwrite the current history entry
    // and force the browser to do a hard navigation to the login page.
    // If the user clicks 'back' after this, they will go to whatever page
    // they were on BEFORE the dashboard.
    window.location.replace("/login");
  };

  return { handleLogout };
}
