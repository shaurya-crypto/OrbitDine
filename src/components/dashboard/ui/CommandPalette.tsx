"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ChefHat, Utensils, LayoutDashboard, LineChart, Settings, Users, Grid, QrCode, Star, BarChart3, Database } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface CommandItem {
  id: string;
  label: string;
  section: string;
  icon: React.ReactNode;
  href: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { roles } = useAuthStore();

  const allItems: CommandItem[] = [
    // Operations
    { id: "kitchen", label: "Kitchen Display", section: "Operations", icon: <ChefHat size={16} />, href: "/dashboard/kitchen", keywords: ["kds", "orders", "cook"] },
    { id: "staff", label: "Floor Staff", section: "Operations", icon: <Utensils size={16} />, href: "/dashboard/staff", keywords: ["waiter", "tables", "serve"] },
    { id: "tables", label: "Table Management", section: "Operations", icon: <Grid size={16} />, href: "/dashboard/tables", keywords: ["floor", "seating", "capacity"] },

    // Management
    { id: "manager", label: "Manager Dashboard", section: "Management", icon: <LayoutDashboard size={16} />, href: "/dashboard/manager", keywords: ["overview", "operations"] },
    { id: "owner", label: "Owner Dashboard", section: "Management", icon: <LineChart size={16} />, href: "/dashboard/owner", keywords: ["command", "revenue"] },
    { id: "staff-mgmt", label: "Staff Management", section: "Management", icon: <Users size={16} />, href: "/dashboard/manager/staff", keywords: ["roles", "invite", "employees"] },
    { id: "menu", label: "Menu Console", section: "Management", icon: <Settings size={16} />, href: "/dashboard/manager/menu", keywords: ["items", "prices", "categories"] },
    { id: "qr", label: "QR Center", section: "Management", icon: <QrCode size={16} />, href: "/dashboard/manager/qr-center", keywords: ["codes", "scan", "print"] },

    // Analytics
    { id: "analytics", label: "Business Intelligence", section: "Analytics", icon: <BarChart3 size={16} />, href: "/dashboard/owner/analytics", keywords: ["revenue", "charts", "metrics"] },
    { id: "reviews", label: "Reviews & Reputation", section: "Analytics", icon: <Star size={16} />, href: "/dashboard/owner/reviews", keywords: ["feedback", "ratings"] },

    // Settings
    { id: "settings", label: "Owner Settings", section: "Settings", icon: <Settings size={16} />, href: "/dashboard/owner/settings", keywords: ["preferences", "notifications"] },
    { id: "backups", label: "Enterprise Backups", section: "Settings", icon: <Database size={16} />, href: "/dashboard/owner/settings/backups", keywords: ["snapshot", "export", "data"] },
  ];

  // Filter items based on user roles
  const items = allItems.filter(item => {
    if (item.href.includes("/owner") && !roles?.includes("owner")) return false;
    if (item.href.includes("/manager") && !roles?.includes("owner") && !roles?.includes("manager")) return false;
    if (item.href.includes("/kitchen") && !roles?.includes("owner") && !roles?.includes("manager") && !roles?.includes("kitchen")) return false;
    if (item.href.includes("/staff") && !roles?.includes("owner") && !roles?.includes("manager") && !roles?.includes("staff")) return false;
    return true;
  });

  const filteredItems = query.trim()
    ? items.filter(item => {
        const q = query.toLowerCase();
        return item.label.toLowerCase().includes(q) || 
               item.section.toLowerCase().includes(q) ||
               item.keywords?.some(k => k.includes(q));
      })
    : items;

  const sections = [...new Set(filteredItems.map(i => i.section))];

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-elevated border border-border rounded-2xl shadow-2xl overflow-hidden" role="dialog" aria-label="Command Palette">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyNav}
            placeholder="Search pages, settings, actions..."
            className="flex-1 bg-transparent text-text-primary text-[14px] placeholder:text-text-tertiary outline-none"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-medium text-text-tertiary bg-base px-1.5 py-0.5 rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-text-tertiary text-[13px]">
              No results for "{query}"
            </div>
          ) : (
            sections.map(section => (
              <div key={section}>
                <div className="px-4 py-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                  {section}
                </div>
                {filteredItems.filter(i => i.section === section).map(item => {
                  const globalIdx = filteredItems.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors min-h-[44px] ${
                        globalIdx === selectedIndex
                          ? "bg-accent/10 text-accent"
                          : "text-text-primary hover:bg-hover"
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-text-secondary">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ArrowRight size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-text-tertiary">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
