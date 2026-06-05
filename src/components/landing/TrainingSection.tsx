"use client";

import { Presentation, ArrowRight } from "lucide-react";

export function TrainingSection() {
  return (
    <section className="w-full py-24 bg-base border-t border-border" id="training">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-full md:w-2/3 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-text-primary/10 flex items-center justify-center">
                <Presentation className="w-5 h-5 text-text-primary" />
              </div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                Limited Availability
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary tracking-tight mb-4">
              Early Partner Training
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
              We know that introducing new technology can be daunting for your staff. That's why the first restaurants joining OrbitDine receive hands-on onboarding and dedicated staff training assistance to ensure a flawless transition.
            </p>
          </div>

          <div className="w-full md:w-1/3 flex justify-start md:justify-end relative z-10">
            <button className="group relative px-8 py-4 bg-text-primary text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
              <span className="relative z-10 flex items-center font-medium">
                Claim Your Spot
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
