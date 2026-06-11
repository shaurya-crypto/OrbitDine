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
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";

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
  const { roles, setAuth } = useAuthStore();

  useEffect(() => {
    const currentRoles = useAuthStore.getState().roles;
    if (currentRoles && currentRoles.length > 0) {
      const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => currentRoles.includes(r as any)) || "customer";
      router.replace(`/dashboard/${highestRole}`);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setServerError("");
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        
        const responseData = await res.json();
        
        if (responseData.status === "requires_role_selection") {
          window.location.href = "/signup";
          return;
        }

        if (!res.ok) {
          setServerError(responseData.error || "Google authentication failed");
          setIsSubmitting(false);
          return;
        }

        const roles = (responseData.roles && responseData.roles.length > 0) ? responseData.roles : ["customer"];
        setAuth(responseData.userId, roles, responseData.restaurantId, responseData.fullName);
        router.refresh();
        
        if (roles.includes("owner") && !responseData.restaurantId) {
          window.location.href = "/onboarding";
        } else {
          const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => roles.includes(r)) || "customer";
          window.location.href = `/dashboard/${highestRole}`;
        }
      } catch (error) {
        console.error("Login error:", error);
        setServerError("Network error. Please try again.");
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setServerError("Google login failed.");
    }
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
          rememberMe: data.rememberMe,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(responseData.error || "Invalid credentials");
        setIsSubmitting(false);
        return;
      }

      setAuth(responseData.userId, responseData.roles, responseData.restaurantId, responseData.fullName);

      router.refresh();
      
      if (responseData.roles.includes("owner") && !responseData.restaurantId) {
        window.location.href = "/onboarding";
      } else {
        const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => responseData.roles.includes(r));
        window.location.href = `/dashboard/${highestRole || "customer"}`;
      }
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

          <div className="flex flex-col gap-4 mb-6">
            <button
              onClick={() => googleLogin()}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface text-text-primary border border-border rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-secondary">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-6">
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
              className="w-full mt-2"
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
