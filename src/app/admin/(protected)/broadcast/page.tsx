"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useToast } from "@/components/ui/ToastProvider";
import { Radio, AlertTriangle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"announcement" | "maintenance" | "emergency" | "offer">("announcement");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type, targetAudience: "all" }),
      });

      if (!res.ok) throw new Error("Failed to send broadcast");

      toast.success("Broadcast sent successfully!");
      setTitle("");
      setMessage("");
    } catch (err) {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 pb-20 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-tight mb-2">Notification Center</h1>
        <p className="text-zinc-400">Push real-time alerts to the entire platform or specific cohorts.</p>
      </div>

      <GlassPanel className="p-8 border-zinc-800/50 bg-zinc-900/50">
        <form onSubmit={handleBroadcast} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Message Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["announcement", "maintenance", "emergency", "offer"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium capitalize border transition-all ${
                    type === t 
                      ? "bg-red-500/10 border-red-500/50 text-red-500" 
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <FloatingInput
            id="title"
            label="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-white"
          />

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">Detailed Message</label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors resize-none"
              placeholder="Enter the broadcast payload..."
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-500 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              This broadcast will immediately trigger an SSE push to all active administrative connections and be stored in the database for client retrieval.
            </p>
          </div>

          <MagneticButton
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            intensity={2}
          >
            {isSubmitting ? <Loader type="spinner" className="w-5 h-5" /> : (
              <>
                <Radio className="w-5 h-5" />
                Send Broadcast
              </>
            )}
          </MagneticButton>
        </form>
      </GlassPanel>
    </div>
  );
}
