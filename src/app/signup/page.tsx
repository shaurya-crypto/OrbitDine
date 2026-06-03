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

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  restaurantName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const { role } = useAuthStore();

  useEffect(() => {
    // Block logged in users
    if (role) {
      router.replace(`/dashboard/${role.toLowerCase()}`);
    }
  }, [role, router]);

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
    const fieldsToValidate: any[] = ["fullName", "email"];
    if (!restaurantId) {
      fieldsToValidate.push("restaurantName");
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
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
          restaurantName: data.restaurantName,
          restaurantId: restaurantId || undefined,
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
                <p className="text-text-secondary">Tell us a bit about yourself and your restaurant.</p>
              </div>

              <form className="flex flex-col gap-6 mt-4">
                <FloatingInput 
                  id="fullName" 
                  type="text"
                  label="Full Name"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                />
                
                {!restaurantId && (
                  <FloatingInput 
                    id="restaurantName" 
                    type="text"
                    label="Restaurant Name"
                    {...register("restaurantName")}
                    error={errors.restaurantName?.message}
                  />
                )}

                <FloatingInput  
                  id="email" 
                  type="email"
                  label="Work Email"
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
                
                <FloatingInput 
                  id="confirmPassword" 
                  type="password"
                  label="Confirm Password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />

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
