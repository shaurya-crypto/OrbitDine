"use client";

import { usePerformance } from "../providers/PerformanceProvider";
import { Star } from "lucide-react";

export function TrustSection() {
  const { isLowEndMode } = usePerformance();

  const trustItems = [
    { label: "50K+", sub: "Orders Processed" },
    { label: "500+", sub: "Partner Restaurants" },
    { label: "99.9%", sub: "System Uptime" },
    { label: "4.9", sub: "Average Rating", icon: <Star className="w-5 h-5 fill-accent text-accent inline-block mr-2" /> },
  ];

  // Repeat for marquee effect
  const repeatedItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems];

  return (
    <section className="relative w-full py-20 overflow-hidden bg-surface border-y border-border">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10" />

      <div 
        className={`flex items-center gap-16 md:gap-32 w-max ${
          isLowEndMode ? 'justify-center mx-auto' : 'animate-[marquee_40s_linear_infinite]'
        }`}
      >
        {(isLowEndMode ? trustItems : repeatedItems).map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <span className="text-3xl md:text-5xl font-serif text-text-primary mb-2 flex items-center">
              {item.icon}
              {item.label}
            </span>
            <span className="text-sm font-mono text-text-secondary tracking-widest uppercase">
              {item.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
