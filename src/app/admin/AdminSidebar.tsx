"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  Activity, 
  FileDown, 
  LogOut,
  Radio
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/search", label: "Global Search", icon: Activity },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/users", label: "Users & Owners", icon: Users },
  { href: "/admin/plans", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/admin/broadcast", label: "Broadcast", icon: Radio },
  { href: "/admin/exports", label: "Exports", icon: FileDown },
];

export function AdminSidebar({ mobileOpen = false, setMobileOpen = (v: boolean) => {} }: { mobileOpen?: boolean, setMobileOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { handleLogout } = useLogout();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`w-64 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
        <Link href="/admin/dashboard" className="text-2xl font-serif text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          Super<span className="text-zinc-500">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive 
                  ? "bg-red-500/10 text-red-500" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Exit to Login
        </button>
      </div>
      </aside>
    </>
  );
}
