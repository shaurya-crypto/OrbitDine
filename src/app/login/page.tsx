"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(responseData.error || "Invalid credentials");
        setIsSubmitting(false);
        return;
      }

      // Redirect to the dashboard based on role
      router.push(`/dashboard/${responseData.role}`);
    } catch (error) {
      setServerError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-base selection:bg-accent/30 selection:text-text-primary">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-surface border-r border-border">
        {/* Floating Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-accent-soft rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-soft/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <Link href="/" className="text-3xl font-serif tracking-tight text-text-primary block">
            Orbit<span className="text-accent">Dine</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-serif text-text-primary leading-tight mb-6">
            The premium OS for modern restaurants.
          </h2>
          <p className="text-lg text-text-secondary">
            Manage orders, track analytics, and delight your guests—all from one unified platform.
          </p>
        </div>

        {/* Abstract shape / placeholder for visual */}
        <div className="absolute bottom-12 right-12 w-64 h-64 border border-border/40 rounded-full flex items-center justify-center opacity-30">
          <div className="w-48 h-48 border border-border/60 rounded-full" />
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden flex justify-between w-[calc(100%-3rem)] items-center">
          <Link href="/" className="text-2xl font-serif tracking-tight text-text-primary block">
            Orbit<span className="text-accent">Dine</span>
          </Link>
          <Link href="/" className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="w-full max-w-[420px] glass-panel bg-surface/50 p-8 md:p-10 rounded-3xl relative z-10 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-medium text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-secondary">Sign in to your OrbitDine account</p>
          </div>

          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">Email Address</label>
              <input 
                type="email" 
                id="email"
                {...register("email")}
                placeholder="name@restaurant.com" 
                className={`w-full bg-base border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-accent focus:ring-accent'}`}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
                <Link href="/forgot-password" className="text-sm text-accent hover:text-accent/80 transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                id="password"
                {...register("password")}
                placeholder="••••••••" 
                className={`w-full bg-base border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-accent focus:ring-accent'}`}
              />
              {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
            </div>

            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="rememberMe" 
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent" 
              />
              <label htmlFor="rememberMe" className="text-sm text-text-secondary cursor-pointer">Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-text-primary text-base font-medium rounded-xl py-3 mt-2 hover:bg-text-primary/90 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              Don't have an account? <Link href="/signup" className="text-text-primary font-medium hover:underline">Request Access</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
