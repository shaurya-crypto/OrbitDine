"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative bg-base selection:bg-accent/30 selection:text-text-primary">
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-soft rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-accent-soft/60 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] glass-panel bg-surface/80 p-8 md:p-10 rounded-3xl relative z-10 shadow-2xl border border-border">
        {isSubmitted ? (
          <div className="text-center py-6">
             <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-8 h-8 text-accent" />
             </div>
             <h1 className="text-3xl font-medium text-text-primary mb-4">Password reset</h1>
             <p className="text-text-secondary mb-8">
               Your password has been successfully reset.
             </p>
             <Link href="/login" className="w-full bg-text-primary text-base font-medium rounded-xl py-3 flex items-center justify-center hover:bg-text-primary/90 transition-colors">
               Continue to log in
             </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-medium text-text-primary mb-2">Set new password</h1>
              <p className="text-text-secondary">Please enter your new password below.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">New Password</label>
                <input 
                  type="password" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !password || !confirmPassword}
                className="w-full bg-text-primary text-base font-medium rounded-xl py-3 mt-2 hover:bg-text-primary/90 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
