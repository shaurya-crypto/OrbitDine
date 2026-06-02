"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { usePerformance } from "../providers/PerformanceProvider";
import { ThreeScenePlaceholder } from "./ThreeScenePlaceholder";
import { ArrowRight, PlayCircle } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { theme } = useTheme();
  const { isLowEndMode } = usePerformance();

  // Handle Video Theme Switching
  useEffect(() => {
    if (!videoRef.current) return;
    const isDark = theme === "dark" || (!theme && document.documentElement.classList.contains("dark"));
    const src = isDark
      ? videoRef.current.getAttribute("data-dark-src")
      : videoRef.current.getAttribute("data-light-src");

    if (src && videoRef.current.src !== src) {
      videoRef.current.src = src;
      videoRef.current.load();
    }
  }, [theme]);

  // Choreographed Animation Sequence
  useEffect(() => {
    if (!containerRef.current) return;

    // Split text manually for word reveal
    if (headlineRef.current) {
      const text = headlineRef.current.innerText;
      headlineRef.current.innerHTML = text.split(" ").map(word =>
        `<span class="inline-block overflow-hidden"><span class="inline-block translate-y-[120%] opacity-0 word-anim">${word}</span></span>`
      ).join(" ");
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // If low-end mode, skip complex sequence and just fade in
      if (isLowEndMode) {
        tl.to(".word-anim", { y: "0%", opacity: 1, duration: 0.5, stagger: 0.05 })
          .to([subheadRef.current, buttonsRef.current, statsRef.current, visualRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1
          }, "-=0.2");
        return;
      }

      // High-end choreography
      tl.to(".word-anim", {
        y: "0%",
        opacity: 1,
        duration: 1.4,
        stagger: 0.08,
        delay: 0.8 // Wait for Navbar (0.4s)
      })
        .fromTo(subheadRef.current,
          { opacity: 0, y: 20, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
          "1.4"
        )
        .fromTo(buttonsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.0 },
          "1.8"
        )
        .fromTo(statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.0 },
          "2.0"
        )
        .fromTo(visualRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1.5, ease: "power4.out" },
          "2.2"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isLowEndMode]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100vh] min-h-[700px] flex items-center overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src="/hero.mp4"
          data-dark-src="/hero-dark.mp4"
          data-light-src="/hero.mp4"

          className="object-cover w-full h-full opacity-55"
        />
        {/* Gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-base/90 via-base/60 to-transparent lg:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 h-full flex flex-col lg:flex-row items-center">

        {/* Content Side (55% Desktop, 100% Mobile) */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center h-full pt-20 lg:pt-0">
          <div className="max-w-[760px] mx-auto lg:mx-0 text-center lg:text-left">
            <h1
              ref={headlineRef}
              className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight font-serif text-text-primary mb-6"
            >
              Every Restaurant Into A Smart Dining Experience
            </h1>

            <p
              ref={subheadRef}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-10 opacity-0"
            >
              Empower customers to scan, order, track and engage while owners gain complete operational visibility.
            </p>

            <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-16 opacity-0">
              <button className="group relative px-8 py-4 bg-text-primary text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10 flex items-center font-medium">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              <button className="group px-8 py-4 border border-border bg-glass backdrop-blur-lg rounded-full transition-all hover:bg-border/50 active:scale-95 text-text-primary">
                <span className="flex items-center font-medium">
                  <PlayCircle className="mr-2 w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-12 opacity-0">
              {[
                { value: "50K+", label: "Orders" },
                { value: "500+", label: "Restaurants" },
                { value: "99.9%", label: "Uptime" },
                { value: "100K+", label: "Customers" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl md:text-3xl font-mono text-text-primary font-medium tracking-tight mb-1">
                    {stat.value}
                  </span>
                  <span className="text-sm font-mono text-text-secondary uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Side (45% Desktop, Hidden Mobile) */}
        <div
          ref={visualRef}
          className="hidden lg:flex w-[45%] h-full items-center justify-center opacity-0"
        >
          <ThreeScenePlaceholder />
        </div>
      </div>
    </section>
  );
}
