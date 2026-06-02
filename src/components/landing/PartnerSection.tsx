"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { Handshake, TrendingUp, Wallet, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function PartnerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".partner-card",
        { opacity: 0, scale: 0.95, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom-=100",
            end: "center center",
            toggleActions: "play none none reverse",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="w-full py-24 md:py-32 bg-base" id="partnership">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="partner-card w-full max-w-5xl mx-auto bg-surface border border-border rounded-3xl p-8 md:p-16 shadow-sm overflow-hidden relative">
          
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
             <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
               <Handshake className="w-6 h-6 text-accent" />
             </div>
             <span className="font-mono text-sm text-accent uppercase tracking-widest font-medium">Partnership</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-8 relative z-10">
            The Sales Partnership Program
          </h2>
          
          <div className="text-lg text-text-secondary leading-relaxed space-y-6 max-w-3xl relative z-10 mb-12">
            <p>
              For every restaurant you onboard to OrbitDine, you receive a flat monthly payout of <strong className="text-text-primary">₹4,000</strong>.
            </p>
            <p>
              Not a one-time bonus. Every single month that the restaurant remains an active subscriber, you get paid. You own the relationship. We handle the software, the servers, and the technical support.
            </p>
            <p className="font-medium text-text-primary bg-accent/5 p-4 rounded-xl border border-accent/10">
              Build a portfolio of 25 restaurants? That's ₹1,00,000 in purely passive monthly income.
            </p>
          </div>

          <div className="relative z-10">
            <button className="group relative px-8 py-4 bg-text-primary text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center font-medium">
                Become a Partner
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
