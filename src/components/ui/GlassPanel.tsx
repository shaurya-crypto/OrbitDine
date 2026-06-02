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
    if (!interactive || isLowEndMode || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to center of element
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Map to rotation degrees (tilt)
    setRotateY((mouseX / (width / 2)) * depth);
    setRotateX(-(mouseY / (height / 2)) * depth);
  };

  const handleMouseLeave = () => {
    if (!interactive || isLowEndMode) return;
    setRotateX(0);
    setRotateY(0);
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
