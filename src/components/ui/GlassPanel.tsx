"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePerformance } from "@/components/providers/PerformanceProvider";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  premium?: boolean;
  interactive?: boolean;
  depth?: number;
}

export function GlassPanel({ 
  children, 
  className = "", 
  premium = false, 
  interactive = true,
  depth = 10 
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disabled tilt animation as per user request
  };

  const handleMouseLeave = () => {
    // Disabled tilt animation as per user request
  };

  const glassClass = premium ? "glass-panel-premium" : "glass-panel";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.5
      }}
      style={{ perspective: 1000 }}
      className={`rounded-3xl overflow-hidden relative z-[var(--z-content)] ${glassClass} ${className}`}
    >
      {/* Glare effect on hover */}
      {!isLowEndMode && interactive && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-[var(--z-overlay)] mix-blend-overlay"
          animate={{
            background: `radial-gradient(circle at ${50 + (rotateY * 5)}% ${50 - (rotateX * 5)}%, rgba(255,255,255,0.1) 0%, transparent 60%)`
          }}
        />
      )}
      
      <div className="relative z-[var(--z-content)] h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
