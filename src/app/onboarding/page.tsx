"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MapPin, ChefHat, CheckCircle2, Loader2, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const onboardingSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required"),
  restaurantType: z.string().min(2, "Type is required"),
  cuisineType: z.string().min(2, "Cuisine type is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  pinCode: z.string().min(2, "Pin Code is required"),
  totalTables: z.number().min(1, "Must have at least 1 table"),
  staffCount: z.number().min(1, "Must have at least 1 staff member"),
  openingHours: z.string().min(2, "Required"),
  closingHours: z.string().min(2, "Required"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { userId } = useAuthStore();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      totalTables: 10,
      staffCount: 5,
      openingHours: "09:00",
      closingHours: "22:00",
    }
  });

  const nextStep = async (fieldsToValidate: any[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data: OnboardingValues) => {
    setStep(4);
    setIsGenerating(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...data
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate restaurant");
      }
      
      setIsGenerating(false);
      setStep(5);
      
      setTimeout(() => {
        router.push("/dashboard/owner");
      }, 3000);
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      alert("Error generating restaurant. Please try again.");
      setStep(3);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 text-white selection:bg-accent/30">
      <div className="w-full max-w-[600px] bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-800 relative overflow-hidden">
        
        {/* Background Gradients for depth */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
        
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-8 relative z-10">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Step {step} of 3</span>
              <span className="text-xs font-mono text-accent">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Store className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif tracking-tight text-white mb-1">Restaurant Basics</h1>
                  <p className="text-zinc-400 text-sm">Let's start with your identity.</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Restaurant Name</label>
                  <input type="text" {...register("restaurantName")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. The Rustic Spoon" />
                  {errors.restaurantName && <span className="text-xs text-red-400">{errors.restaurantName.message}</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Restaurant Type</label>
                    <input type="text" {...register("restaurantType")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. Fine Dining" />
                    {errors.restaurantType && <span className="text-xs text-red-400">{errors.restaurantType.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Cuisine Type</label>
                    <input type="text" {...register("cuisineType")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. Italian" />
                    {errors.cuisineType && <span className="text-xs text-red-400">{errors.cuisineType.message}</span>}
                  </div>
                </div>

                <button onClick={() => nextStep(["restaurantName", "restaurantType", "cuisineType"])} className="w-full bg-white text-zinc-900 font-medium rounded-xl py-4 mt-4 hover:bg-zinc-200 transition-colors">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <MapPin className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif tracking-tight text-white mb-1">Location</h1>
                  <p className="text-zinc-400 text-sm">Where can customers find you?</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Country</label>
                    <input type="text" {...register("country")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.country && <span className="text-xs text-red-400">{errors.country.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">State / Region</label>
                    <input type="text" {...register("state")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.state && <span className="text-xs text-red-400">{errors.state.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">City</label>
                    <input type="text" {...register("city")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.city && <span className="text-xs text-red-400">{errors.city.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Pin Code</label>
                    <input type="text" {...register("pinCode")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.pinCode && <span className="text-xs text-red-400">{errors.pinCode.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Street Address</label>
                  <input type="text" {...register("address")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                  {errors.address && <span className="text-xs text-red-400">{errors.address.message}</span>}
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={() => setStep(1)} className="w-1/3 bg-zinc-800 text-white font-medium rounded-xl py-4 hover:bg-zinc-700 transition-colors">Back</button>
                  <button onClick={() => nextStep(["country", "state", "city", "pinCode", "address"])} className="w-2/3 bg-white text-zinc-900 font-medium rounded-xl py-4 hover:bg-zinc-200 transition-colors">Continue</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Settings className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif tracking-tight text-white mb-1">Operations</h1>
                  <p className="text-zinc-400 text-sm">Scale your business logic.</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Total Tables</label>
                    <input type="number" {...register("totalTables", { valueAsNumber: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.totalTables && <span className="text-xs text-red-400">{errors.totalTables.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Staff Count</label>
                    <input type="number" {...register("staffCount", { valueAsNumber: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" />
                    {errors.staffCount && <span className="text-xs text-red-400">{errors.staffCount.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Opening Hours</label>
                    <input type="time" {...register("openingHours")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none [color-scheme:dark]" />
                    {errors.openingHours && <span className="text-xs text-red-400">{errors.openingHours.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-300">Closing Hours</label>
                    <input type="time" {...register("closingHours")} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none [color-scheme:dark]" />
                    {errors.closingHours && <span className="text-xs text-red-400">{errors.closingHours.message}</span>}
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={() => setStep(2)} className="w-1/3 bg-zinc-800 text-white font-medium rounded-xl py-4 hover:bg-zinc-700 transition-colors">Back</button>
                  <button onClick={handleSubmit(onSubmit)} className="w-2/3 bg-accent text-white font-medium rounded-xl py-4 hover:bg-accent/90 transition-colors">Generate Restaurant</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center relative z-10">
               <Loader2 className="w-16 h-16 text-accent animate-spin mb-6" />
               <h1 className="text-2xl font-serif tracking-tight text-white mb-2">Generating Ecosystem...</h1>
               <div className="text-zinc-400 text-sm space-y-2 mt-4 animate-pulse">
                 <p>Provisioning Database...</p>
                 <p>Generating QR Codes...</p>
                 <p>Setting up Menu Categories...</p>
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 relative z-10">
               <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent/30 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                 <CheckCircle2 className="w-12 h-12 text-accent" />
               </div>
               <h1 className="text-3xl font-serif tracking-tight text-white mb-4">Restaurant Ready</h1>
               <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-left max-w-sm mx-auto mb-8">
                 <ul className="space-y-3 text-sm text-zinc-300">
                   <li className="flex items-center"><div className="w-2 h-2 rounded-full bg-accent mr-3"/> Tables Created</li>
                   <li className="flex items-center"><div className="w-2 h-2 rounded-full bg-accent mr-3"/> Unique QRs Generated</li>
                   <li className="flex items-center"><div className="w-2 h-2 rounded-full bg-accent mr-3"/> Default Menu Ready</li>
                 </ul>
               </div>
               <p className="text-zinc-500 text-sm animate-pulse">Redirecting to Owner Dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
