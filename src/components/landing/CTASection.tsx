"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePerformance } from "../providers/PerformanceProvider";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const rings = gsap.utils.toArray<HTMLElement>(".cta-ring");
      rings.forEach((ring, i) => {
        gsap.to(ring, {
          rotation: 360,
          duration: 30 + i * 10,
          repeat: -1,
          ease: "none",
          transformOrigin: "center center",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="relative w-full h-[85vh] min-h-[600px] bg-base flex flex-col items-center justify-center overflow-hidden">
      {/* Central Orbit Ring Animation */}
      {!isLowEndMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="cta-ring absolute w-[300px] h-[300px] rounded-full border border-accent/50 border-dashed" />
          <div className="cta-ring absolute w-[500px] h-[500px] rounded-full border border-text-primary/20 border-dashed" />
          <div className="cta-ring absolute w-[800px] h-[800px] rounded-full border border-accent/30 border-dashed" />
        </div>
      )}

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-soft rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h2 className="text-5xl md:text-7xl font-serif text-text-primary tracking-tight mb-8">
          Ready To Transform Your Restaurant?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group relative px-8 py-4 bg-text-primary text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
            <span className="relative z-10 flex items-center justify-center font-medium">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          <button className="group px-8 py-4 border border-border bg-glass backdrop-blur-lg rounded-full transition-all hover:bg-border/50 active:scale-95 text-text-primary w-full sm:w-auto">
            <span className="font-medium">
              Book Demo
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
