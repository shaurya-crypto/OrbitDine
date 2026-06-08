"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Loader } from "@/components/ui/Loader";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, Suspense } from "react";

import { useGoogleLogin } from "@react-oauth/google";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [step, setStep] = useState<number | "google_role_selection">(1);
  const [googlePayload, setGooglePayload] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const inviteRole = searchParams.get("role");
  const [roleSelection, setRoleSelection] = useState<string>(inviteRole || "customer");
  const { roles: storeRoles, setAuth } = useAuthStore();

  useEffect(() => {
    if (storeRoles && storeRoles.length > 0) {
      const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => storeRoles.includes(r as any)) || "customer";
      router.replace(`/dashboard/${highestRole}`);
    }
  }, [storeRoles, router]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const password = watch("password", "");

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await trigger(["fullName", "email"]);
    if (isValid) {
      setStep(2);
    }
  };

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
          setGooglePayload(responseData);
          setStep("google_role_selection");
          setIsSubmitting(false);
          return;
        }

        if (!res.ok) {
          setServerError(responseData.error || "Google sign-in failed");
          setIsSubmitting(false);
          return;
        }

        setAuth(responseData.userId, responseData.roles, responseData.restaurantId, responseData.fullName);
          
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
    },
    onError: () => {
      setServerError("Google sign-in failed.");
    }
  });

  const handleGoogleRegister = async () => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...googlePayload,
          role: roleSelection,
          restaurantId: restaurantId || undefined,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        setServerError(responseData.error || "Failed to create account");
        setIsSubmitting(false);
        return;
      }

      setAuth(responseData.userId, responseData.roles, responseData.restaurantId, responseData.fullName);
      
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

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          restaurantId: restaurantId || undefined,
          role: roleSelection,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(responseData.error || "An error occurred during signup");
        setIsSubmitting(false);
        return;
      }

      setStep(3);
    } catch (error) {
      setServerError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative bg-base selection:bg-accent/30 selection:text-text-primary">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-soft rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-accent-soft/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
         <Link href="/" className="text-2xl font-serif tracking-tight text-text-primary">
           Orbit<span className="text-accent">Dine</span>
         </Link>
         <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
           Log in instead
         </Link>
      </div>

      <GlassPanel premium className="w-full max-w-[480px] p-8 md:p-12 shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <span className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 block">Step 1 of 2</span>
                <h1 className="text-3xl font-medium text-text-primary mb-2">Create your account</h1>
                <p className="text-text-secondary">Join OrbitDine today.</p>
              </div>

              {/* Account Type Selector (only if not invited) */}
              {!restaurantId && (
                <div className="flex bg-surface border border-border p-1 rounded-xl mb-6">
                  <button 
                    type="button"
                    onClick={() => setRoleSelection("customer")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleSelection === "customer" ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                  >
                    Customer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRoleSelection("owner")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleSelection === "owner" ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                  >
                    Business Owner
                  </button>
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
                  <span className="bg-surface px-2 text-text-secondary">Or sign up with email</span>
                </div>
              </div>

              <form className="flex flex-col gap-6">
                <FloatingInput 
                  id="fullName" 
                  type="text"
                  label="Full Name"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                />

                <FloatingInput  
                  id="email" 
                  type="email"
                  label="Email Address"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <MagneticButton 
                  onClick={handleNext} 
                  type="button"
                  className="w-full mt-2"
                  intensity={5}
                >
                  Continue
                </MagneticButton>
              </form>
            </motion.div>
          )}

          {step === "google_role_selection" && (
            <motion.div
              key="google_role_selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
               <div className="mb-8 flex flex-col gap-4">
                <button onClick={() => setStep(1)} className="self-start text-text-secondary hover:text-text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-medium text-text-primary mb-2">Almost there!</h1>
                  <p className="text-text-secondary">How do you want to use OrbitDine?</p>
                </div>
              </div>

              {serverError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 mb-4">
                  {serverError}
                </div>
              )}

              <div className="flex flex-col gap-4 mb-8">
                <button 
                  onClick={() => setRoleSelection("customer")}
                  className={`p-6 rounded-xl border text-left transition-all ${roleSelection === "customer" ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-text-secondary"}`}
                >
                  <h3 className="text-lg font-medium text-text-primary mb-1">I am a Customer</h3>
                  <p className="text-sm text-text-secondary">I want to order food and discover great restaurants.</p>
                </button>
                
                <button 
                  onClick={() => setRoleSelection("owner")}
                  className={`p-6 rounded-xl border text-left transition-all ${roleSelection === "owner" ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-text-secondary"}`}
                >
                  <h3 className="text-lg font-medium text-text-primary mb-1">I am a Restaurant Owner</h3>
                  <p className="text-sm text-text-secondary">I want to manage my restaurant and view analytics.</p>
                </button>
              </div>

              <MagneticButton 
                onClick={handleGoogleRegister} 
                disabled={isSubmitting}
                className="w-full"
                intensity={5}
              >
                {isSubmitting ? <Loader type="spinner" className="w-5 h-5 border-t-base" /> : "Complete Registration"}
              </MagneticButton>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
               <div className="mb-8 flex flex-col gap-4">
                <button onClick={() => setStep(1)} className="self-start text-text-secondary hover:text-text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 block">Step 2 of 2</span>
                  <h1 className="text-3xl font-medium text-text-primary mb-2">Secure your account</h1>
                  <p className="text-text-secondary">Choose a strong password.</p>
                </div>
              </div>

              {serverError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 mb-4">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1 relative">
                  <FloatingInput 
                    id="password" 
                    type="password"
                    label="Password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  
                  {password.length > 0 && !errors.password && (
                    <div className="mt-2 flex items-center justify-between px-1">
                      <div className="flex gap-1 flex-1 mr-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength - 1] : 'bg-border'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary font-mono">{strengthLabels[Math.max(0, strength - 1)]}</span>
                    </div>
                  )}
                </div>
                


                <div className="text-sm text-text-secondary mt-2 px-1">
                  By completing registration, you agree to our <Link href="#" className="text-text-primary underline">Terms of Service</Link> and <Link href="#" className="text-text-primary underline">Privacy Policy</Link>.
                </div>

                <MagneticButton 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-2"
                  intensity={5}
                >
                  {isSubmitting ? <Loader type="spinner" className="w-5 h-5 border-t-base" /> : "Complete Registration"}
                </MagneticButton>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-8"
            >
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                 className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
               >
                 <CheckCircle2 className="w-10 h-10 text-accent" />
               </motion.div>
               
               <h1 className="text-3xl font-medium text-text-primary mb-4">Account Created</h1>
               <p className="text-text-secondary mb-8">
                 We've sent a verification link to your email. Please verify your account to continue.
               </p>

               <div className="w-12 h-1 bg-border rounded-full mx-auto overflow-hidden">
                 <motion.div 
                   className="h-full bg-text-primary"
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 2, ease: "easeInOut" }}
                   onAnimationComplete={() => {
                     router.push('/login');
                   }}
                 />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </main>
  );
}
