"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    title: "Waiter Dependency",
    description: "Guests wait an average of 12 minutes just to place their initial order.",
    number: "01"
  },
  {
    title: "Order Mistakes",
    description: "Manual entry leads to comped meals and frustrated customers.",
    number: "02"
  },
  {
    title: "Slow Payments",
    description: "The check process adds unnecessary friction at the end of a great meal.",
    number: "03"
  },
  {
    title: "Poor Feedback Loop",
    description: "Managers only hear about issues when it's too late via public reviews.",
    number: "04"
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
      // Pin the left column while the right column scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top+=100",
        end: "bottom bottom",
        pin: leftColRef.current,
        pinSpacing: false,
      });

      // Fade in each problem card as it enters the viewport
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
        <div ref={leftColRef} className="w-full md:w-1/2 flex flex-col justify-start">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-text-primary tracking-tight mb-6">
            The Dining Experience Is Broken.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-md">
            Traditional restaurant operations rely on outdated manual processes, causing friction for both guests and staff.
          </p>
        </div>

        {/* Right Column - Scrolling List */}
        <div ref={rightColRef} className="w-full md:w-1/2 flex flex-col gap-12 md:gap-32 pb-32">
          {problems.map((prob, i) => (
            <div 
              key={i} 
              className={`problem-card flex flex-col ${isLowEndMode ? '' : 'min-h-[40vh] justify-center'}`}
            >
              <span className="text-sm font-mono text-accent mb-4 border border-accent/20 rounded-full px-3 py-1 w-max">
                {prob.number}
              </span>
              <h3 className="text-3xl md:text-4xl font-medium text-text-primary mb-4">
                {prob.title}
              </h3>
              <p className="text-lg text-text-secondary">
                {prob.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
