"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";

gsap.registerPlugin(ScrollTrigger);

const roles = [
  {
    title: "Owner",
    access: ["Multi-location analytics", "Revenue tracking", "Staff performance", "High-level reporting"]
  },
  {
    title: "Manager",
    access: ["Table management", "Live menu editing", "Refunds & comps", "Shift oversight"]
  },
  {
    title: "Staff",
    access: ["Table status", "Ready orders", "Bill requests", "Customer assistance"]
  },
  {
    title: "Kitchen",
    access: ["Digital KDS", "Order queue", "Preparation timers", "Item 86ing requests"]
  },
  {
    title: "Customer",
    access: ["QR Ordering", "Live bill splitting", "Apple/Google Pay", "Order tracking"]
  },
  {
    title: "Admin",
    access: ["System configuration", "User management", "Billing & subscriptions", "Integrations"]
  }
];

export function RolesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".role-card");
      
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { 
            opacity: 0, 
            y: 100, 
            z: -150,
            rotationX: 25,
            filter: "blur(20px)",
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.4,
            delay: (i % 3) * 0.15,
            ease: "power3.out",
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
    <section 
      ref={containerRef} 
      className="w-full py-32 lg:py-48 bg-surface relative overflow-hidden" 
      id="roles"
      style={{ perspective: "2000px" }}
    >
      {/* Premium subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-24 md:mb-32">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-text-primary tracking-tight mb-6">
            Built For Every Role.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            A unified system that gives every team member exactly what they need, the moment they need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {roles.map((role, i) => (
            <div 
              key={i} 
              className="role-card group p-10 bg-base/60 backdrop-blur-xl border border-border/40 hover:border-text-primary/20 hover:bg-base rounded-[2rem] flex flex-col gap-8 shadow-sm transition-all duration-700 ease-out"
            >
              <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
                <span className="text-xs font-mono text-text-secondary tracking-widest uppercase opacity-60">
                  Role 0{i + 1}
                </span>
                <h3 className="text-3xl lg:text-4xl font-serif font-light text-text-primary tracking-tight group-hover:text-accent transition-colors duration-500">
                  {role.title}
                </h3>
              </div>
              
              <ul className="space-y-4">
                {role.access.map((item, idx) => (
                  <li key={idx} className="flex items-start text-text-secondary">
                    <span className="w-1.5 h-1.5 flex-shrink-0 bg-accent rounded-full mt-2 mr-4 transition-transform group-hover:scale-[1.5] group-hover:bg-accent/80 duration-500" />
                    <span className="text-base tracking-wide font-light leading-snug text-text-primary/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
