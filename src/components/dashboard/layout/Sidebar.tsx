"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { ChefHat, LayoutDashboard, Utensils, LineChart, LogOut, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { RequestRoleModal } from "./RequestRoleModal";

export function Sidebar({ mobileOpen = false, setMobileOpen = (v: boolean) => {} }: { mobileOpen?: boolean, setMobileOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { roles, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const links = [
    { name: "Kitchen", href: "/dashboard/kitchen", icon: <ChefHat size={20} />, roles: ["kitchen", "staff", "manager", "owner"] },
    { name: "Floor Staff", href: "/dashboard/staff", icon: <Utensils size={20} />, roles: ["staff", "manager", "owner"] },
    { name: "Manager", href: "/dashboard/manager", icon: <LayoutDashboard size={20} />, roles: ["manager", "owner"] },
    { name: "Owner", href: "/dashboard/owner", icon: <LineChart size={20} />, roles: ["owner"] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`w-64 h-screen bg-neutral-900 text-white flex flex-col fixed left-0 top-0 border-r border-neutral-800 z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6">
        <h1 className="text-2xl font-serif tracking-tight text-white mb-1">OrbitDine</h1>
        <p className="text-neutral-400 text-xs tracking-widest uppercase">Operations</p>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          // If the user has none of the required roles for this link, hide it.
          const hasAccess = roles && roles.some(r => link.roles.includes(r));
          if (!hasAccess && roles && roles.length > 0) return null;

          const isActive = pathname === link.href;

          return (
            <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)}>
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-white text-neutral-900 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-neutral-800 flex flex-col gap-3">
        {roles && !roles.includes("owner") && (
          <button 
            onClick={() => setShowRoleModal(true)}
            className="flex items-center justify-center space-x-2 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
          >
            <ShieldAlert size={14} />
            <span>Request Role Upgrade</span>
          </button>
        )}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-sm">
            <p className="text-white font-medium">{roles && roles.length > 0 ? roles.join(", ") : "Select Role"}</p>
          </div>
          {roles && roles.length > 0 && (
            <button onClick={logout} className="text-neutral-500 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
      {showRoleModal && <RequestRoleModal onClose={() => setShowRoleModal(false)} />}
    </div>
    </>
  );
}
