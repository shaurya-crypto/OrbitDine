"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { QrCode, TrendingUp, MenuSquare, Wallet, LineChart, MessageSquare } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "QR Ordering",
    desc: "A completely custom-branded ordering experience that loads instantly.",
    icon: QrCode,
  },
  {
    title: "Live Tracking",
    desc: "Guests know exactly when their food is being prepared and when it's on the way.",
    icon: TrendingUp,
  },
  {
    title: "Menu Management",
    desc: "Update items, prices, and 86'd ingredients across all locations instantly.",
    icon: MenuSquare,
  },
  {
    title: "Payments",
    desc: "Apple Pay, Google Pay, and seamless bill splitting directly from the phone.",
    icon: Wallet,
  },
  {
    title: "Analytics",
    desc: "Deep insights into top-performing items, table turnover times, and staff performance.",
    icon: LineChart,
  },
  {
    title: "Feedback Engine",
    desc: "Catch unhappy customers before they leave a public review with private feedback.",
    icon: MessageSquare,
  }
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const featureRows = gsap.utils.toArray<HTMLElement>(".feature-row");
      
      featureRows.forEach((row) => {
        const textSide = row.querySelector('.text-side');
        const visualSide = row.querySelector('.visual-side');
        
        gsap.fromTo(textSide,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top center+=100",
              end: "center center",
              toggleActions: "play none none reverse",
            }
          }
        );
        
        gsap.fromTo(visualSide,
          { opacity: 0, scale: 0.9, rotateY: 15 },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: row,
              start: "top center+=100",
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
    <section ref={containerRef} className="relative w-full py-24 md:py-32 bg-base" id="features">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="text-center mb-24 md:mb-40">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-text-primary tracking-tight">
            Everything You Need.<br/>Nothing You Don't.
          </h2>
        </div>

        <div className="flex flex-col gap-32 lg:gap-48">
          {/* Row 1: Left Text, Right Visual */}
          <div className="feature-row flex flex-col lg:flex-row items-center gap-12 lg:gap-24 perspective-[1000px]">
            <div className="text-side w-full lg:w-1/2">
              <QrCode className="w-12 h-12 text-accent mb-8" />
              <h3 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">
                Frictionless Ordering.
              </h3>
              <p className="text-lg text-text-secondary max-w-lg mb-8">
                Eliminate wait times. Guests scan, browse a beautifully branded menu, and send orders straight to the kitchen without waiting for a server.
              </p>
              <ul className="space-y-4">
                {["No app required", "Custom branding", "Allergen tagging"].map((item, i) => (
                  <li key={i} className="flex items-center text-text-primary font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="visual-side w-full lg:w-1/2 aspect-square md:aspect-[4/3] bg-surface rounded-3xl border border-border shadow-xl glass-panel relative overflow-hidden flex items-center justify-center">
              <div className="w-64 h-64 border border-border rounded-xl flex flex-col items-center justify-center bg-base p-6 rotate-[-5deg]">
                 <QrCode className="w-32 h-32 text-text-primary mb-4" />
                 <span className="font-mono text-sm">Scan to Order</span>
              </div>
            </div>
          </div>

          {/* Row 2: Right Text, Left Visual */}
          <div className="feature-row flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24 perspective-[1000px]">
            <div className="text-side w-full lg:w-1/2 lg:pl-12">
              <LineChart className="w-12 h-12 text-accent mb-8" />
              <h3 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">
                Actionable Analytics.
              </h3>
              <p className="text-lg text-text-secondary max-w-lg mb-8">
                Stop guessing. See exactly what's selling, track table turnover in real-time, and monitor staff performance from any device.
              </p>
              <ul className="space-y-4">
                {["Live sales tracking", "Item profitability", "Turnover metrics"].map((item, i) => (
                  <li key={i} className="flex items-center text-text-primary font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="visual-side w-full lg:w-1/2 aspect-square md:aspect-[4/3] bg-surface rounded-3xl border border-border shadow-xl glass-panel relative overflow-hidden flex items-center justify-center">
               <div className="w-3/4 h-3/4 flex flex-col gap-4">
                 <div className="w-full h-1/2 border border-border rounded-xl bg-base flex items-end p-4 gap-2">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                     <div key={i} className="flex-1 bg-accent/40 rounded-t-sm" style={{ height: `${h}%` }} />
                   ))}
                 </div>
                 <div className="w-full h-1/2 flex gap-4">
                   <div className="flex-1 border border-border rounded-xl bg-base" />
                   <div className="flex-1 border border-border rounded-xl bg-base" />
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
