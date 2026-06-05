"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { usePerformance } from "../providers/PerformanceProvider";
import { QrCode, TrendingUp, MenuSquare, Wallet, LineChart, MessageSquare } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";


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
              scrub: true,
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
              scrub: true,
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
            Everything You Need.<br />Nothing You Don't.
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
            <GlassPanel interactive={false} className="visual-side w-full lg:w-1/2 h-[400px] relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-3xl" />
              <div className="absolute inset-0 border-2 border-white/10 rounded-3xl backdrop-blur-xl p-8 flex items-center justify-center">
                <QrCode className="w-40 h-40 text-text-primary animate-float" />
                <div className="absolute bottom-6 right-6 bg-surface border border-border rounded-xl p-2 px-4 shadow-lg">
                  <p className="text-sm font-medium text-text-primary">Scan Me</p>
                </div>
              </div>
            </GlassPanel>
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
            <GlassPanel premium interactive={false} className="visual-side w-full lg:w-1/2 aspect-square md:aspect-[4/3] relative flex items-center justify-center p-0 overflow-hidden">
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full" />
              <div className="w-[100%] h-[100%] max-w-[100%] flex flex-col gap-3 relative z-10">
                <div className="w-full flex-1 border border-border rounded-2xl bg-surface/80 backdrop-blur-xl flex items-end p-4 gap-2 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-x-0 bottom-1/4 border-b border-border/20 w-full z-0" />
                  <div className="absolute inset-x-0 bottom-2/4 border-b border-border/20 w-full z-0" />
                  <div className="absolute inset-x-0 bottom-3/4 border-b border-border/20 w-full z-0" />

                  {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-accent/80 rounded-t-md hover:bg-accent transition-colors relative z-10"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    />
                  ))}
                </div>
                <div className="w-full h-1/3 flex gap-3">
                  <div className="flex-1 border border-border rounded-2xl bg-surface/80 backdrop-blur-xl shadow-xl flex flex-col justify-center p-4">
                    <span className="text-[10px] text-text-secondary font-mono mb-1 uppercase tracking-wider">Revenue</span>
                    <span className="text-lg md:text-xl font-medium text-text-primary">+34%</span>
                  </div>
                  <div className="flex-1 border border-border rounded-2xl bg-surface/80 backdrop-blur-xl shadow-xl flex flex-col justify-center p-4">
                    <span className="text-[10px] text-text-secondary font-mono mb-1 uppercase tracking-wider">Turnover</span>
                    <span className="text-lg md:text-xl font-medium text-text-primary">-12 min</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

        </div>
      </div>
    </section>
  );
}
