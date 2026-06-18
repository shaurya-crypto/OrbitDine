"use client";

import { ReactNode, useState } from "react";
import { AdminSidebar } from "../AdminSidebar";
import { Menu } from "lucide-react";

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dark flex min-h-screen bg-black text-white selection:bg-red-500/30 selection:text-white">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-4 z-40">
        <h1 className="text-xl font-serif text-white">OrbitDine Admin</h1>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-zinc-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 md:ml-64 min-h-screen relative overflow-x-hidden pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
