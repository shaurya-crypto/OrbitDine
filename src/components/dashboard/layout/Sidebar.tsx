"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  ChefHat, Utensils, LayoutDashboard, LineChart, LogOut,
  Settings, Search, X, ChevronDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { RequestRoleModal } from "./RequestRoleModal";
import { useLogout } from "@/hooks/useLogout";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

export function Sidebar({ mobileOpen = false, setMobileOpen = () => { } }: SidebarProps) {
  const pathname = usePathname();
  const { roles, name } = useAuthStore();
  const { handleLogout } = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // if (!mounted) return null;

  const sections: NavSection[] = [
    {
      title: "Operations",
      items: [
        { name: "Kitchen", href: "/dashboard/kitchen", icon: <ChefHat size={18} />, roles: ["kitchen", "staff", "manager", "owner"] },
        { name: "Floor Staff", href: "/dashboard/staff", icon: <Utensils size={18} />, roles: ["staff", "manager", "owner"] },
      ]
    },
    {
      title: "Management",
      items: [
        { name: "Manager", href: "/dashboard/manager", icon: <LayoutDashboard size={18} />, roles: ["manager", "owner"] },
        { name: "Owner", href: "/dashboard/owner", icon: <LineChart size={18} />, roles: ["owner"] },
      ]
    },
    {
      title: "Settings",
      items: [
        { name: "Manager Settings", href: "/dashboard/manager/settings", icon: <Settings size={18} />, roles: ["manager"] },
        { name: "Owner Settings", href: "/dashboard/owner/settings", icon: <Settings size={18} />, roles: ["owner"] },
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const primaryRole = roles?.find(r => ["owner", "manager", "staff", "kitchen"].includes(r)) || "customer";

  return (
    <>
      {/* Mobile Overlay */}
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">OD</span>
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-text-primary tracking-tight leading-none">OrbitDine</h1>
              <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest mt-0.5">Operations</p>
            </div>
          </div>
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Trigger */}
        <div className="px-3 py-3">
          <button
            onClick={() => {
              setMobileOpen(false);
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-base border border-border rounded-xl text-[13px] text-text-tertiary hover:text-text-secondary hover:border-border-hover transition-colors min-h-[44px]"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="hidden sm:inline text-[10px] font-medium bg-surface px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1" role="navigation">
          {sections.map(section => {
            const visibleItems = section.items.filter(item =>
              roles && roles.some(r => item.roles.includes(r))
            );
            if (visibleItems.length === 0) return null;

            const isCollapsed = collapsedSections[section.title];

            return (
              <div key={section.title} className="py-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider hover:text-text-secondary transition-colors"
                  aria-expanded={!isCollapsed}
                >
                  {section.title}
                  <ChevronDown size={12} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>

                {!isCollapsed && (
                  <div className="mt-0.5 space-y-0.5">
                    {visibleItems.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors min-h-[44px] ${isActive
                              ? "bg-accent/10 text-accent border-l-2 border-accent ml-0"
                              : "text-text-secondary hover:text-text-primary hover:bg-hover"
                            }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-2">
          {/* Role Badge + User Info */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-[10px] font-bold uppercase">
                  {primaryRole.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-text-primary truncate">{name || primaryRole}</p>
                <p className="text-[10px] text-text-tertiary capitalize">{primaryRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-hover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] text-text-tertiary">Theme</span>
            {mounted ? (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="px-2.5 py-1 text-[11px] font-medium text-text-secondary bg-base border border-border rounded-lg hover:bg-hover transition-colors min-h-[32px]"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            ) : (
              <div className="w-[45px] h-[32px] skeleton rounded-lg" />
            )}
          </div>
        </div>

        {showRoleModal && <RequestRoleModal onClose={() => setShowRoleModal(false)} />}
      </aside>
    </>
  );
}
