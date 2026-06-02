"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Loader } from "@/components/ui/Loader";

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

        <GlassPanel premium className="w-full max-w-[420px] p-8 md:p-10 shadow-2xl">
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
            <div className="flex flex-col gap-6 mt-4">
              <FloatingInput 
                id="email"
                type="email"
                label="Email Address"
                {...register("email")}
                error={errors.email?.message}
              />
              
              <div className="flex flex-col gap-1">
                <FloatingInput 
                  id="password"
                  type="password"
                  label="Password"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" className="text-sm text-text-secondary hover:text-accent transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
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

            <MagneticButton 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4"
              intensity={5}
            >
              {isSubmitting ? <Loader type="spinner" className="w-5 h-5 border-t-base" /> : "Sign In"}
            </MagneticButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              Don't have an account? <Link href="/signup" className="text-text-primary font-medium hover:underline">Request Access</Link>
            </p>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
