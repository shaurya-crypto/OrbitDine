"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-accent" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-accent/30 border-t-accent"
            />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-serif text-text-primary mb-4"
        >
          We're building this.
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-secondary mb-10 text-lg leading-relaxed"
        >
          This feature is currently under construction and will be available in an upcoming update. We appreciate your patience!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => router.back()}
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-text-primary text-base font-medium hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
          
          <button 
            disabled
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full border border-border text-text-secondary bg-surface font-medium cursor-not-allowed opacity-70"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </button>
        </motion.div>
      </div>
    </div>
  );
}
