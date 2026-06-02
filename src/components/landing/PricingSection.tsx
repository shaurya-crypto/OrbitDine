"use client";

import { useRef, useState, useEffect } from "react";
import { usePerformance } from "../providers/PerformanceProvider";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$99",
    desc: "For small cafes and single locations.",
    features: ["Digital Menu", "QR Ordering", "Basic Analytics", "Email Support"]
  },
  {
    name: "Professional",
    price: "$249",
    desc: "For growing restaurants that need more power.",
    features: ["Everything in Starter", "Live Table Tracking", "Staff Performance", "Priority Support", "Custom Branding"],
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For multi-location groups and franchises.",
    features: ["Everything in Pro", "Custom Integrations", "Dedicated Account Manager", "API Access", "White Labeling"]
  }
];

export function PricingSection() {
  const { isLowEndMode } = usePerformance();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (isLowEndMode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-base relative overflow-hidden" id="pricing">
      {/* Spotlight Effect */}
      {!isLowEndMode && (
        <div 
          className="absolute pointer-events-none w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y,
            opacity: mousePos.x === -1000 ? 0 : 1
          }}
        />
      )}

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-4">
            Simple, Transparent Pricing.
          </h2>
          <p className="text-lg text-text-secondary">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={`p-8 rounded-3xl border flex flex-col relative ${
                plan.highlight 
                  ? 'bg-surface border-accent shadow-2xl scale-100 md:scale-105 z-10' 
                  : 'bg-base border-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1 text-xs font-mono uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-medium text-text-primary mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-serif text-text-primary">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-text-secondary">/mo</span>}
              </div>
              <p className="text-text-secondary mb-8">{plan.desc}</p>
              
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center text-text-primary">
                    <Check className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 ${
                plan.highlight 
                  ? 'bg-text-primary text-base' 
                  : 'bg-surface border border-border text-text-primary hover:bg-border/50'
              }`}>
                {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
