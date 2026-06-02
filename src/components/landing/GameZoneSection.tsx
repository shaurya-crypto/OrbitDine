"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePerformance } from "../providers/PerformanceProvider";
import { Dices, BrainCircuit, LayoutGrid, Camera } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const games = [
  {
    icon: Dices,
    title: "Spin the Wheel",
    desc: "An 8-segment wheel, spun once per session. Result is determined server-side — no manipulation possible. Prizes include 2% off, 5% off, 10% off, ₹50 voucher, ₹100 voucher, free dessert, and try-again.",
  },
  {
    icon: BrainCircuit,
    title: "Quest Trivia",
    desc: "One general knowledge question. Get it right and earn 2–5% off the current bill. Keeps customers mentally engaged and makes wait time feel shorter.",
  },
  {
    icon: LayoutGrid,
    title: "Memory Match",
    desc: "A grid of food and brand-themed cards. Match pairs faster for a better reward — 2–5% off. Familiar to everyone, quick to play, always satisfying.",
  },
  {
    icon: Camera,
    title: "Photo Quest",
    desc: "Customer photographs their meal or restaurant experience and shares it. Reward: 10% off the current bill. Restaurant gets free, organic social media visibility from real guests.",
  }
];

export function GameZoneSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".game-card");
      cards.forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
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
    <section ref={containerRef} className="relative w-full py-24 md:py-32 bg-surface border-y border-border" id="game-zone">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary tracking-tight mb-8">
            Turn Wait Time Into Your Biggest Marketing Advantage
          </h2>
          <div className="flex flex-col gap-6 text-lg text-text-secondary leading-relaxed text-left md:text-center">
            <p>
              While food is being prepared, your customers aren't staring at the table anymore. They're playing. And winning rewards that bring them back next time.
            </p>
            <p>
              The OrbitDine Game Zone unlocks automatically the moment an order is placed. Four mini-games. One session each. Every reward applies directly to the current bill. The moment food is served — the games disappear. Clean, contained, and genuinely exciting for customers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {games.map((game, i) => (
            <div key={i} className="game-card bg-base border border-border rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <game.icon className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-text-primary mb-3">
                  {game.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {game.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full bg-base border border-border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-text-secondary tracking-wide uppercase leading-loose">
            Each game is played once per order session only &middot; Games are only active while food is being prepared &middot; All rewards apply automatically to the current bill &middot; Once food is served, the Game Zone closes
          </p>
        </div>

      </div>
    </section>
  );
}
