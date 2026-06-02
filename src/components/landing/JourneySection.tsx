"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { QrCode, BookOpen, Settings2, CheckCircle2, Clock, CreditCard } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: QrCode, title: "Scan QR", desc: "Instantly access the digital menu without app downloads." },
  { icon: BookOpen, title: "Browse Menu", desc: "Rich visuals, detailed descriptions, and dietary tagging." },
  { icon: Settings2, title: "Customize", desc: "Easily modify ingredients and add special requests." },
  { icon: CheckCircle2, title: "Place Order", desc: "Send directly to the kitchen POS in real-time." },
  { icon: Clock, title: "Track Order", desc: "Live status updates from kitchen to table." },
  { icon: CreditCard, title: "Pay & Review", desc: "Split bills, tip, and leave feedback seamlessly." }
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
        <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight">The Perfect Journey</h2>
      </div>

      <div 
        ref={scrollWrapperRef}
        className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24 px-6 md:px-12 lg:px-24 w-full lg:w-max"
      >
        <div className="hidden lg:block w-[400px] flex-shrink-0">
          <h2 className="text-5xl lg:text-7xl font-serif text-text-primary tracking-tight leading-tight">
            The<br/>Perfect<br/>Journey.
          </h2>
          <p className="mt-6 text-xl text-text-secondary">
            A frictionless experience from the moment they sit down to the moment they leave.
          </p>
        </div>

        {steps.map((step, i) => (
          <div 
            key={i}
            className="flex-shrink-0 w-full lg:w-[400px] aspect-square bg-base rounded-3xl p-10 flex flex-col justify-between border border-border/50 relative overflow-hidden group"
          >
            {/* Background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-soft rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <span className="text-sm font-mono text-accent mb-8 block">Step 0{i + 1}</span>
              <step.icon className="w-12 h-12 text-text-primary mb-6" strokeWidth={1.5} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-medium text-text-primary mb-3">{step.title}</h3>
              <p className="text-lg text-text-secondary">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
