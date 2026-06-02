"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
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
             <h1 className="text-3xl font-medium text-text-primary mb-4">Check your email</h1>
             <p className="text-text-secondary mb-8">
               We've sent a password reset link to <br/>
               <span className="text-text-primary font-medium">{email}</span>
             </p>
             <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
               Return to log in
             </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-6 group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to log in
              </Link>
              <h1 className="text-3xl font-medium text-text-primary mb-2">Forgot password?</h1>
              <p className="text-text-secondary">No worries, we'll send you reset instructions.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com" 
                  required
                  className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !email}
                className="w-full bg-text-primary text-base font-medium rounded-xl py-3 mt-2 hover:bg-text-primary/90 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? "Sending..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
