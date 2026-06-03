"use client";

import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { QrCode, ShieldAlert } from "lucide-react";
import { RequestRoleModal } from "@/components/dashboard/layout/RequestRoleModal";
import { useState } from "react";

export default function CustomerDashboardPage() {
  const { name } = useAuthStore();
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-text-primary">Welcome, {name}</h1>
        <p className="text-text-secondary">Your account is currently limited to basic customer access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassPanel premium className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mb-6">
            <QrCode size={32} className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-medium mb-2 text-text-primary">Order as a Guest</h2>
          <p className="text-text-secondary text-sm mb-6">
            To place an order at a table, simply scan the QR code located on the table using your phone's camera.
          </p>
        </GlassPanel>

        <GlassPanel premium className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-amber-500/20">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2 text-text-primary">Are you Staff?</h2>
          <p className="text-text-secondary text-sm mb-6">
            If you work here, you can request an account upgrade to access the operational dashboards.
          </p>
          <button 
            onClick={() => setShowRoleModal(true)}
            className="px-6 py-3 bg-text-primary text-base rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            Request Access Upgrade
          </button>
        </GlassPanel>
      </div>
      
      {showRoleModal && <RequestRoleModal onClose={() => setShowRoleModal(false)} />}
    </div>
  );
}
