"use client";

import { motion } from "framer-motion";
import { usePerformance } from "@/components/providers/PerformanceProvider";
import { GlassPanel } from "./GlassPanel";

interface LoaderProps {
  type?: "spinner" | "shimmer" | "skeleton-card";
  className?: string;
}

export function Loader({ type = "spinner", className = "" }: LoaderProps) {
  const { isLowEndMode } = usePerformance();

  if (type === "shimmer") {
    return (
      <div className={`relative overflow-hidden bg-base border border-border rounded-xl ${className}`}>
        {!isLowEndMode && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
        )}
      </div>
    );
  }

  if (type === "skeleton-card") {
    return (
      <GlassPanel interactive={false} className={`p-6 flex flex-col gap-4 ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-accent/5 animate-pulse" />
        <div className="w-3/4 h-6 rounded bg-text-secondary/10 animate-pulse" />
        <div className="w-full h-4 rounded bg-text-secondary/5 animate-pulse" />
        <div className="w-5/6 h-4 rounded bg-text-secondary/5 animate-pulse" />
      </GlassPanel>
    );
  }

  // Premium Spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full border-2 border-border border-t-accent"
      />
    </div>
  );
}
