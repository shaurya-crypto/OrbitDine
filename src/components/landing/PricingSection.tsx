"use client";

import { useRef, useState, useEffect } from "react";
import { usePerformance } from "../providers/PerformanceProvider";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Month 1",
    price: "Standard",
    desc: "Full features from day one.",
    features: ["Zero commission on orders", "Zero percentage of revenue", "Complete system access", "Founder-led support"]
  },
  {
    name: "Month 2",
    price: "15% Off",
    desc: "Your subscription cost drops.",
    features: ["Everything in Month 1", "Keep 100% of your revenue", "Loyalty system active", "Analytics fully populated"],
    highlight: true
  },
  {
    name: "Month 3+",
    price: "30% Off",
    desc: "Maximum savings, forever.",
    features: ["Lowest subscription tier", "Price never increases based on performance", "Full multi-location support", "All future updates included"]
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
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-6">
            Straightforward Pricing. No Hidden Anything.
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            Flat monthly subscription. Zero commission on orders. Zero percentage of revenue. You pay one number. We deliver the entire system.
          </p>
          <p className="text-lg text-text-primary font-medium">
            And unlike delivery platforms that quietly grow their cut — our price doesn't change based on how well your restaurant does. The longer you stay, the more you save:
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
                Become a Partner
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
