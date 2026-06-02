"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Loader } from "@/components/ui/Loader";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to verify email");
        }

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative bg-base selection:bg-accent/30 selection:text-text-primary">
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-soft rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-accent-soft/60 rounded-full blur-[100px] pointer-events-none" />

      <GlassPanel premium className="w-full max-w-[420px] p-8 md:p-10 shadow-2xl text-center">
        {status === "loading" && (
          <div className="py-8 flex flex-col items-center">
            <Loader type="spinner" className="mb-6 w-12 h-12" />
            <h1 className="text-2xl font-medium text-text-primary mb-2">Verifying Email</h1>
            <p className="text-text-secondary">Please wait while we verify your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-medium text-text-primary mb-4">Email Verified</h1>
            <p className="text-text-secondary mb-8">
              Your account has been successfully verified. You can now access your dashboard.
            </p>
            <Link href="/login" className="block w-full">
              <MagneticButton className="w-full" intensity={5}>
                Continue to Login
              </MagneticButton>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-medium text-text-primary mb-4">Verification Failed</h1>
            <p className="text-text-secondary mb-8">{errorMessage}</p>
            <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
              Return to Login
            </Link>
          </div>
        )}

      </GlassPanel>
    </main>
  );
}
