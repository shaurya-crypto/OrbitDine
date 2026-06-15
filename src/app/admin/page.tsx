"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Loader } from "@/components/ui/Loader";
import { ShieldAlert } from "lucide-react";

export default function AdminGatePage() {
  const [passphrase, setPassphrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/verify-passphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setIsSubmitting(false);
        return;
      }

      // Success, route to login to get JWT
      router.push("/login");
    } catch (err) {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black selection:bg-accent/30 selection:text-white p-4">
      {/* Dark background, very subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <GlassPanel premium className="p-8 md:p-10 shadow-2xl border-white/10 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-serif text-white mb-2 tracking-tight">Enterprise Access</h1>
            <p className="text-zinc-400 text-sm">
              Restricted area. Enter the master passphrase to proceed to authentication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <FloatingInput
                id="passphrase"
                type="password"
                label="Master Passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                error={error || undefined}
                autoFocus
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <MagneticButton
              type="submit"
              disabled={isSubmitting || !passphrase}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              intensity={5}
            >
              {isSubmitting ? <Loader type="spinner" className="w-5 h-5 border-t-white" /> : "Verify Access"}
            </MagneticButton>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-xs uppercase tracking-widest font-medium">
              OrbitDine Internal Operations
            </p>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
