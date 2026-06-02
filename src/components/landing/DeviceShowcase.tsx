"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";

gsap.registerPlugin(ScrollTrigger);

export function DeviceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const devices = gsap.utils.toArray<HTMLElement>(".parallax-device");
      
      devices.forEach((device, i) => {
        const speed = parseFloat(device.dataset.speed || "1");
        
        gsap.to(device, {
          y: () => -100 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="relative w-full py-32 md:py-48 bg-base overflow-hidden flex flex-col items-center">
      <div className="text-center mb-24 z-20 px-6">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-text-primary tracking-tight mb-6">
          Designed for Every Screen.
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Whether your staff uses tablets, your managers use desktops, or your guests use their own smartphones.
        </p>
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto h-[60vh] md:h-[80vh] flex items-center justify-center">
        
        {/* Desktop Mockup (Center) */}
        <div className="absolute z-10 w-[80%] max-w-[900px] aspect-[16/10] bg-surface rounded-[2rem] border border-border/60 shadow-2xl overflow-hidden glass-panel">
          {/* Top Bar */}
          <div className="w-full h-8 bg-border/20 border-b border-border/30 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-border/40" />
            <div className="w-3 h-3 rounded-full bg-border/40" />
            <div className="w-3 h-3 rounded-full bg-border/40" />
          </div>
          {/* Content Placeholder */}
          <div className="w-full h-full bg-surface-dark flex items-center justify-center">
            <p className="font-mono text-text-secondary">Desktop Interface Preview</p>
          </div>
        </div>

        {/* Tablet Mockup (Left) */}
        <div 
          className="parallax-device absolute z-20 left-[5%] md:left-[10%] top-[20%] w-[35%] max-w-[400px] aspect-[3/4] bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden glass-panel"
          data-speed="1.5"
        >
          <div className="absolute inset-2 border border-border/20 rounded-2xl bg-surface-dark flex items-center justify-center">
             <p className="font-mono text-text-secondary text-sm">Tablet Preview</p>
          </div>
        </div>

        {/* Mobile Mockup (Right) */}
        <div 
          className="parallax-device absolute z-30 right-[5%] md:right-[15%] bottom-[10%] w-[25%] max-w-[280px] aspect-[9/19.5] bg-surface rounded-[2.5rem] border-[4px] border-border shadow-2xl overflow-hidden glass-panel"
          data-speed="2.2"
        >
           {/* Notch */}
           <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
             <div className="w-32 h-full bg-border rounded-b-xl" />
           </div>
           <div className="w-full h-full bg-surface-dark flex items-center justify-center">
             <p className="font-mono text-text-secondary text-xs">Mobile App Preview</p>
          </div>
        </div>

      </div>
    </section>
  );
}
