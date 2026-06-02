"use client";

import { usePerformance } from "../providers/PerformanceProvider";
import { Star } from "lucide-react";

const reviews = [
  { text: "OrbitDine transformed how we handle peak hours. Tips are up 15%.", author: "Sarah J.", role: "Owner, The Rustic Spoon" },
  { text: "Our table turn time dropped by 8 minutes. Invaluable.", author: "Michael T.", role: "General Manager" },
  { text: "Guests love not having to wave down a waiter for the check.", author: "Elena R.", role: "Operations Director" },
  { text: "Best software decision we made this year.", author: "David W.", role: "Restaurateur" },
  { text: "It paid for itself in the first weekend.", author: "James K.", role: "Owner" },
  { text: "Seamless integration and beautiful UI.", author: "Amanda L.", role: "F&B Manager" },
];

export function TestimonialsSection() {
  const { isLowEndMode } = usePerformance();

  const Row = ({ reverse = false, speed = "40s" }) => {
    const items = [...reviews, ...reviews];
    
    return (
      <div className="flex w-max relative">
        <div 
          className={`flex gap-6 px-3 ${!isLowEndMode && 'hover:[animation-play-state:paused]'}`}
          style={{ 
            animation: isLowEndMode ? 'none' : `marquee ${speed} linear infinite ${reverse ? 'reverse' : 'normal'}`
          }}
        >
          {items.map((r, i) => (
            <div key={i} className="w-[350px] md:w-[450px] p-8 bg-surface border border-border rounded-2xl flex-shrink-0">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-accent text-accent" />)}
              </div>
              <p className="text-lg text-text-primary mb-6 font-medium">"{r.text}"</p>
              <div>
                <p className="text-text-primary font-medium">{r.author}</p>
                <p className="text-sm font-mono text-text-secondary uppercase">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 md:py-32 bg-base overflow-hidden border-y border-border relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-base to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-base to-transparent z-10" />
      
      <div className="text-center mb-16 relative z-10 px-6">
        <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight">Loved by Operators.</h2>
      </div>

      <div className="flex flex-col gap-6">
        <Row speed="50s" />
        <Row reverse speed="45s" />
        <Row speed="55s" />
      </div>
    </section>
  );
}
