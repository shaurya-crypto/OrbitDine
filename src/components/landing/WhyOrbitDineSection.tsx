"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { Ban, Database, UserCheck, WifiOff, Zap, LayoutTemplate } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const differentiators = [
  {
    icon: Ban,
    title: "No Commissions",
    desc: "Flat monthly subscription only. We never take a percentage of your orders. Your revenue stays your revenue.",
  },
  {
    icon: Database,
    title: "Data Ownership",
    desc: "All customer data, analytics, and insights belong to you. We will never sell or share your restaurant's data. Ever.",
  },
  {
    icon: UserCheck,
    title: "Founder-Led Support",
    desc: "Bajrang Saran personally responds to every inquiry within 24 hours. No call centers, no ticket queues, no automated replies.",
  },
  {
    icon: WifiOff,
    title: "Offline Capability",
    desc: "The manager dashboard works without internet. Queue actions locally, sync when back online. Your restaurant doesn't stop because the internet did.",
  },
  {
    icon: Zap,
    title: "Live in 7–10 Days",
    desc: "Not months. Not 6-week onboarding projects. Your restaurant goes live on OrbitDine within a week of signing — with full support throughout.",
  },
  {
    icon: LayoutTemplate,
    title: "Built in 2026",
    desc: "Modern tech stack from the ground up. Fast, reliable, and built to scale with your restaurant — not retrofitted from legacy software.",
  },
];

export function WhyOrbitDineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".diff-card");
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: (i % 3) * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
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
    <section ref={containerRef} className="w-full py-24 md:py-32 bg-base" id="why-orbitdine">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary tracking-tight">
            Built Different. For Restaurants That Are Serious.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentiators.map((diff, i) => (
            <div key={i} className="diff-card p-8 bg-surface border border-border rounded-3xl flex flex-col gap-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-text-primary flex items-center justify-center">
                <diff.icon className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-text-primary mb-3">
                  {diff.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {diff.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
