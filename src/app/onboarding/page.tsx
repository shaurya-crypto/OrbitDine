"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MapPin, ChefHat, CheckCircle2 } from "lucide-react";

const onboardingSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required"),
  cuisineType: z.string().min(2, "Cuisine type is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  totalTables: z.number().min(1, "Must have at least 1 table"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      totalTables: 10,
    }
  });

  const nextStep = async (fieldsToValidate: any[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data: OnboardingValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, send to /api/onboarding
      // await fetch('/api/onboarding', { method: 'POST', body: JSON.stringify(data) });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStep(4);
      setTimeout(() => {
        router.push("/dashboard/owner");
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-base">
      <div className="w-full max-w-[600px] glass-panel bg-surface p-8 md:p-12 rounded-3xl shadow-xl border border-border">
        
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono text-text-secondary uppercase">Step {step} of 3</span>
              <span className="text-xs font-mono text-accent">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Store className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-text-primary">Restaurant Details</h1>
                  <p className="text-text-secondary text-sm">Let's start with the basics.</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">Restaurant Name</label>
                  <input 
                    type="text" 
                    {...register("restaurantName")}
                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    placeholder="e.g. The Rustic Spoon"
                  />
                  {errors.restaurantName && <span className="text-xs text-red-500">{errors.restaurantName.message}</span>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">Cuisine Type</label>
                  <input 
                    type="text" 
                    {...register("cuisineType")}
                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    placeholder="e.g. Italian, Fusion, Cafe"
                  />
                  {errors.cuisineType && <span className="text-xs text-red-500">{errors.cuisineType.message}</span>}
                </div>

                <button 
                  onClick={() => nextStep(["restaurantName", "cuisineType"])} 
                  className="w-full bg-text-primary text-base font-medium rounded-xl py-3 mt-4 hover:bg-text-primary/90 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MapPin className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-text-primary">Location</h1>
                  <p className="text-text-secondary text-sm">Where can customers find you?</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">Street Address</label>
                  <input 
                    type="text" 
                    {...register("address")}
                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    placeholder="123 Main St"
                  />
                  {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">City</label>
                  <input 
                    type="text" 
                    {...register("city")}
                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    placeholder="San Francisco"
                  />
                  {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={() => setStep(1)} className="w-1/3 bg-transparent border border-border text-text-primary font-medium rounded-xl py-3 hover:bg-border/50 transition-colors">
                    Back
                  </button>
                  <button onClick={() => nextStep(["address", "city"])} className="w-2/3 bg-text-primary text-base font-medium rounded-xl py-3 hover:bg-text-primary/90 transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <ChefHat className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-text-primary">Capacity</h1>
                  <p className="text-text-secondary text-sm">How many tables do you have?</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">Total Tables (For QR Generation)</label>
                  <input 
                    type="number" 
                    {...register("totalTables", { valueAsNumber: true })}
                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                  {errors.totalTables && <span className="text-xs text-red-500">{errors.totalTables.message}</span>}
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={() => setStep(2)} className="w-1/3 bg-transparent border border-border text-text-primary font-medium rounded-xl py-3 hover:bg-border/50 transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isSubmitting}
                    className="w-2/3 bg-text-primary text-base font-medium rounded-xl py-3 hover:bg-text-primary/90 transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
               <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10 text-accent" />
               </div>
               <h1 className="text-3xl font-medium text-text-primary mb-4">You're all set!</h1>
               <p className="text-text-secondary mb-8">
                 We're preparing your dashboard. You will be redirected shortly.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
