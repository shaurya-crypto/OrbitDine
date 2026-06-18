"use client";

import { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { usePerformance } from "@/components/providers/PerformanceProvider";
import { transitionSpring } from "@/lib/design-system";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "glass" | "ghost";
  intensity?: number;
}

export function MagneticButton({ 
  children, 
  variant = "primary", 
  intensity = 15,
  className = "",
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { isLowEndMode } = usePerformance();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLowEndMode || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Magnetic pull
    setPosition({ 
      x: (mouseX / width) * intensity, 
      y: (mouseY / height) * intensity 
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-text-primary text-base border border-transparent shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]";
      case "secondary":
        return "bg-surface border border-border text-text-primary hover:bg-border/30";
      case "glass":
        return "glass-panel text-text-primary hover:border-text-secondary/50";
      case "ghost":
        return "bg-transparent text-text-secondary hover:text-text-primary";
      default:
        return "bg-text-primary text-base";
    }
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={transitionSpring}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative px-8 py-4 rounded-full font-medium transition-colors overflow-hidden group",
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {/* Button Glow effect */}
      {!isLowEndMode && variant !== "ghost" && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
