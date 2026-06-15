import { ReactNode } from "react";
import { AdminSidebar } from "../AdminSidebar";

export const metadata = {
  title: "Super Admin | OrbitDine",
  description: "Enterprise Control Center",
  robots: "noindex, nofollow", // Strict SEO blocking
};

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-red-500/30 selection:text-white">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen relative overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
