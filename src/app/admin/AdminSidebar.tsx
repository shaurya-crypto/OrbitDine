"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Store, Users, CreditCard, 
  ShieldAlert, Activity, FileDown, LogOut, Radio, Database, Search
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

import { useState, useEffect } from "react";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/search", label: "Global Search", icon: Activity },
    ]
  },
  {
    title: "Platform",
    items: [
      { href: "/admin/restaurants", label: "Restaurants", icon: Store },
      { href: "/admin/users", label: "Users & Owners", icon: Users },
      { href: "/admin/plans", label: "Subscriptions", icon: CreditCard },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
      { href: "/admin/broadcast", label: "Broadcast", icon: Radio },
      { href: "/admin/exports", label: "Exports", icon: FileDown },
      { href: "/admin/backups", label: "Backups", icon: Database },
      { href: "/admin/recovery", label: "Recovery Center", icon: Activity },
    ]
  }
];

export function AdminSidebar({ mobileOpen = false, setMobileOpen = (v: boolean) => {} }: { mobileOpen?: boolean, setMobileOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { handleLogout } = useLogout();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside 
        className={`h-screen bg-surface flex flex-col z-50 transition-transform duration-200 ease-out fixed top-0 left-0 w-[280px] min-w-[280px] shrink-0 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} border-r border-border`}
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-text-primary tracking-tight leading-none">
                Super<span className="text-text-tertiary">Admin</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-base border border-border rounded-xl text-[13px] text-text-tertiary min-h-[40px]">
            <Search size={14} />
            <span>Search…</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-3" role="navigation">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <div className="px-2 py-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                {section.title}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors min-h-[40px] ${
                        isActive 
                          ? "bg-red-500/10 text-red-400 border-l-2 border-red-400" 
                          : "text-text-secondary hover:text-text-primary hover:bg-hover"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-colors w-full min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Exit to Login
          </button>
        </div>
      </aside>
    </>
  );
}
