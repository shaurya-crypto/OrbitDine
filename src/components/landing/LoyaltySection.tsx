"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { Star, Heart, Crown, Gift, RotateCcw, PartyPopper } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  { name: "First Visit", icon: Star, discount: "5% off", msg: `"Welcome! 5% off your first order."` },
  { name: "Returning (2–4)", icon: RotateCcw, discount: "10% off", msg: `"Welcome back! 10% off as a thank you."` },
  { name: "Loyal (5–9)", icon: Heart, discount: "15% off", msg: `"You're a loyal customer! 15% off today."` },
  { name: "VIP (10+ / ₹5k+)", icon: Crown, discount: "20% + free item", msg: `"VIP status. 20% off + complimentary dessert."` },
  { name: "Lapsed (30+ days)", icon: Gift, discount: "20% off", msg: `"We missed you! 20% off to welcome you back."` },
  { name: "Birthday month", icon: PartyPopper, discount: "25% + free cake", msg: `"Happy Birthday! 25% off + free cake slice."` },
];

export function LoyaltySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".tier-row");
      rows.forEach((row, i) => {
        gsap.fromTo(row,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top bottom-=50",
              end: "center center",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="relative w-full py-24 md:py-32 bg-base" id="loyalty">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        
        {/* Left Side: Copy & Stat */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary tracking-tight mb-6">
            Every Returning Customer Gets a Better Deal. Automatically.
          </h2>
          <p className="text-lg text-text-secondary mb-12 max-w-xl leading-relaxed">
            OrbitDine recognizes returning customers by phone number the moment they scan the QR code. No loyalty cards. No apps to download. No staff intervention. The right discount shows up on their menu before they even order.
          </p>
          
          <div className="bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <h4 className="text-xl font-medium text-text-primary mb-3 relative z-10">
              The Loyalty Impact
            </h4>
            <p className="text-text-secondary relative z-10">
              Restaurants using OrbitDine's loyalty system target a <strong className="text-text-primary">40%+ return rate</strong> within 30 days — against an industry average of just 20%.
            </p>
          </div>
        </div>

        {/* Right Side: Tiers List */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {tiers.map((tier, i) => (
            <div key={i} className="tier-row flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface border border-border rounded-2xl gap-4">
              <div className="flex items-center gap-4 w-full sm:w-1/3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <tier.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="font-medium text-text-primary">{tier.name}</div>
              </div>
              <div className="w-full sm:w-1/4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm w-max">
                  {tier.discount}
                </span>
              </div>
              <div className="w-full sm:w-5/12 text-sm text-text-secondary italic">
                {tier.msg}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
