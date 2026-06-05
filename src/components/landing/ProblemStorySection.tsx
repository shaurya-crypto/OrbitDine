"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    title: "Order Errors",
    description: "Verbal orders between servers and kitchen cause mistakes on 15% of tables. Wasted ingredients. Comped meals. Customer frustration every single shift.",
    number: "01"
  },
  {
    title: "Peak Hour Chaos",
    description: "When it's full, everything breaks. Orders pile up, coordination collapses, your best customers wait too long and leave annoyed.",
    number: "02"
  },
  {
    title: "Slow Table Turnover",
    description: "Customers sit for 12–15 minutes just waiting to order. That's revenue you're bleeding on every shift, every day.",
    number: "03"
  },
  {
    title: "Limited Insights",
    description: "You're running your business on instinct. No data on which dishes actually make money, no visibility into peak patterns, no forecasting.",
    number: "04"
  },
  {
    title: "Customer Retention",
    description: "No system to recognize who's been here before. No way to reward loyalty. Customers drift away and you have no idea why.",
    number: "05"
  },
  {
    title: "Multi-Location Complexity",
    description: "Each branch runs differently. Inconsistent experience, no unified data, impossible to compare performance or make smart decisions.",
    number: "06"
  },
  {
    title: "High Commission Fees",
    description: "Delivery platforms take 20–30% of every order. You're doing all the work. They're keeping the margin.",
    number: "07"
  }
];

export function ProblemStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current || !leftColRef.current || !rightColRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in each problem card as it enters the viewport with a scrub
      const cards = gsap.utils.toArray<HTMLElement>(".problem-card");
      cards.forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0.2, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top center+=200",
              end: "center center",
              scrub: true,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section ref={containerRef} className="relative w-full py-24 md:py-32 bg-base" id="problems">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Left Column - Sticky */}
        <div ref={leftColRef} className="w-full md:w-1/2 flex flex-col justify-start md:sticky md:top-32 h-max">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-text-primary tracking-tight mb-6">
            Why Restaurants Are Losing Money Right Now
          </h2>
        </div>

        {/* Right Column - Scrolling List */}
        <div ref={rightColRef} className="w-full md:w-1/2 flex flex-col gap-12 md:gap-16 pb-10 md:pb-32">
          {problems.map((prob, i) => (
            <div 
              key={i} 
              className="problem-card flex flex-col justify-center min-h-[25vh]"
            >
              <span className="text-xs md:text-sm font-mono text-accent mb-3 border border-accent/20 rounded-full px-3 py-1 w-max bg-accent/5">
                {prob.number}
              </span>
              <h3 className="text-2xl md:text-4xl font-medium text-text-primary mb-2 md:mb-4">
                {prob.title}
              </h3>
              <p className="text-base md:text-lg text-text-secondary">
                {prob.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
