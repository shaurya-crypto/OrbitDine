"use client";

import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { User, Mail, Shield } from "lucide-react";
import { SmartBackButton } from "@/components/shared/SmartBackButton";

export default function CustomerSettingsPage() {
  const { name, roles } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-8 pt-4">
      <div className="flex items-center gap-4 mb-8">
        <SmartBackButton 
          fallbackRoute="/dashboard/customer"
          label=""
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-primary hover:bg-border/50 transition-all group"
        />
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Account Settings</h1>
          <p className="text-text-secondary">Manage your customer profile</p>
        </div>
      </div>

      <GlassPanel premium className="p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 bg-accent/10 rounded-full border border-accent/20 flex items-center justify-center text-accent text-3xl font-serif uppercase">
            {name?.[0] || "?"}
          </div>
          <div>
            <h2 className="text-2xl font-serif text-text-primary">{name}</h2>
            <p className="text-text-secondary flex items-center gap-1 mt-1">
              <Shield className="w-4 h-4" /> Customer Account
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input 
              type="text" 
              disabled 
              value={name || ""} 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary opacity-70 cursor-not-allowed" 
            />
            <p className="text-xs text-text-secondary mt-1">Contact support to change your name.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Shield className="w-4 h-4" /> Active Roles
            </label>
            <div className="flex gap-2 flex-wrap">
              {roles.map(r => (
                <span key={r} className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wider">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
