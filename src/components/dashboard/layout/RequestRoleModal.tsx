"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useAuthStore } from "@/stores/authStore";

interface RequestRoleModalProps {
  onClose: () => void;
}

export function RequestRoleModal({ onClose }: RequestRoleModalProps) {
  const { userId, restaurantId } = useAuthStore();
  const [requestedRole, setRequestedRole] = useState<"manager" | "staff" | "kitchen">("staff");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!userId || !restaurantId) {
      setMessage("Session missing. Please log out and log back in to verify your account.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/role-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, restaurantId, requestedRole }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setMessage(data.error || "Failed to submit request");
      } else {
        setMessage("Request submitted! The owner will review it.");
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <GlassPanel premium className="w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors">✕</button>
        <h2 className="text-2xl font-serif mb-2 text-text-primary">Request Role Upgrade</h2>
        <p className="text-text-secondary text-sm mb-6">Select the staff role you need access to. This will notify the restaurant owner.</p>
        
        <div className="space-y-3 mb-6">
          {["staff", "kitchen", "manager"].map((r) => (
            <label key={r} className="flex items-center space-x-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-border/30 transition-colors">
              <input 
                type="radio" 
                name="role" 
                value={r} 
                checked={requestedRole === r} 
                onChange={() => setRequestedRole(r as any)}
                className="text-accent focus:ring-accent"
              />
              <span className="capitalize text-text-primary font-medium">{r}</span>
            </label>
          ))}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes("submitted") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-border/30 hover:text-text-primary transition-colors font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-text-primary text-base rounded-xl font-medium transition-colors hover:opacity-90">
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
