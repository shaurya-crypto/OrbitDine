"use client";

import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "../AdminSidebar";
import { Menu } from "lucide-react";

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="dark min-h-screen bg-base text-text-primary selection:bg-red-500/30 selection:text-white">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-40">
        <h1 className="text-[15px] font-semibold text-text-primary tracking-tight">OrbitDine Admin</h1>
        <button 
          onClick={() => setMobileOpen(true)} 
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 md:ml-[280px]">
        {children}
      </main>
    </div>
  );
}
