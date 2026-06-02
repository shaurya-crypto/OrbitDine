"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { QrCode, BookOpen, Settings2, ChefHat, Heart, CreditCard } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: QrCode, title: "Scan & Connect", desc: "Guests scan the QR at their table. No app download, no account creation required. They are instantly connected to your ecosystem." },
  { icon: BookOpen, title: "Browse & Order", desc: "A beautifully branded digital menu with rich photos and smart upsells. Orders are sent straight to the kitchen without waiting for a server." },
  { icon: ChefHat, title: "Kitchen Display", desc: "Orders instantly appear on the KDS. No lost tickets, no verbal miscommunications. Staff know exactly what to prepare and when." },
  { icon: CreditCard, title: "Eat & Pay", desc: "Guests pay securely via Apple Pay or Google Pay. They can split the bill item-by-item directly on their phones." },
  { icon: Heart, title: "Loyalty Engine", desc: "Optional sign-up after payment unlocks rewards and birthday treats, giving you the data to bring them back again and again." },
];

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    // Disable horizontal scroll pin on low end devices or mobile (handled by CSS primarily but we also disable GSAP here)
    if (isLowEndMode || window.innerWidth < 1024) return;
    if (!containerRef.current || !scrollWrapperRef.current) return;

    const ctx = gsap.context(() => {
      const wrapperWidth = scrollWrapperRef.current?.scrollWidth || 0;
      const windowWidth = window.innerWidth;
      
      gsap.to(scrollWrapperRef.current, {
        x: () => -(wrapperWidth - windowWidth + 100), // scroll left
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          end: () => `+=${wrapperWidth}`,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="relative w-full bg-surface border-y border-border py-24 lg:py-0 lg:h-screen lg:flex lg:items-center overflow-hidden">
      <div className="lg:hidden px-6 md:px-12 mb-12">
        <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight">One Platform. Three Systems. Everything Connected.</h2>
      </div>

      <div 
        ref={scrollWrapperRef}
        className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24 px-6 md:px-12 lg:px-24 w-full lg:w-max"
      >
        <div className="hidden lg:block w-[400px] flex-shrink-0">
          <h2 className="text-5xl lg:text-7xl font-serif text-text-primary tracking-tight leading-tight">
            One Platform.<br/>Three Systems.<br/>Everything Connected.
          </h2>
          <p className="mt-6 text-xl text-text-secondary">
            OrbitDine connects your customers, your kitchen, and your ownership in one integrated system that works in real time — even without internet.
          </p>
        </div>

        {steps.map((step, i) => (
          <GlassPanel 
            premium
            key={i}
            className="flex-shrink-0 w-full lg:w-[450px] aspect-auto min-h-[400px] p-8 md:p-10 flex flex-col justify-between group overflow-hidden"
          >
            {/* Background blue motion blur effect */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <span className="text-xs font-mono text-accent mb-6 block border border-accent/20 w-max px-3 py-1 rounded-full bg-accent/5">Phase 0{i + 1}</span>
              <div className="w-16 h-16 rounded-2xl bg-surface/80 border border-border flex items-center justify-center mb-8 shadow-inner group-hover:border-accent/30 transition-colors">
                <step.icon className="w-8 h-8 text-text-primary group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-medium text-text-primary mb-4">{step.title}</h3>
              <p className="text-lg text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
