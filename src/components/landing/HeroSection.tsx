"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScroll, useTransform, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { usePerformance } from "../providers/PerformanceProvider";
// import { ThreeScenePlaceholder } from "./ThreeScenePlaceholder";
import { ArrowRight, PlayCircle } from "lucide-react";
import React from "react";

export interface HeroSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function HeroSection({ title, subtitle }: HeroSectionProps = {}) {
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
  }, [isLowEndMode, title]); // Re-run animation if title changes

  // Scroll scrub effects
  const { scrollY } = useScroll();
  // Start fading and blurring only after scrolling 300px down (leaving the hero)
  const heroOpacity = useTransform(scrollY, [300, 1000], [1, 0]);
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]);
  const heroBlur = useTransform(scrollY, [300, 1000], ["blur(0px)", "blur(20px)"]);


  return (
    <motion.section
      ref={containerRef}
      style={{ opacity: heroOpacity, y: heroY, filter: isLowEndMode ? "none" : heroBlur }}
      className="relative w-full min-h-screen h-auto flex items-center justify-center overflow-hidden py-32 lg:py-0"
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

          className="object-cover w-full h-full opacity-70"
        />
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-base/20 via-base/60 to-base" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-12 lg:px-24 h-auto min-h-screen flex flex-col items-center justify-center text-center">

        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-[6rem] leading-[1.05] tracking-tight font-serif text-text-primary mb-6 max-w-5xl"
        >
          {title || "A Complete Restaurant Management Software"}
        </h1>

        <p
          ref={subheadRef}
          className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10 opacity-0 leading-relaxed"
        >
          {subtitle || "OrbitDine is the ultimate restaurant QR ordering system and digital menu software. Replace manual order-taking with a real-time kitchen display system (KDS)."}
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0">
          <button className="group relative px-8 py-4 bg-text-primary text-base rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]">
            <span className="relative z-10 flex items-center font-medium">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          <button className="group px-8 py-4 border border-border bg-glass backdrop-blur-lg rounded-full transition-all hover:bg-border/50 active:scale-95 text-text-primary">
            <span className="flex items-center font-medium">
              <PlayCircle className="mr-2 w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              See How It Works
            </span>
          </button>
        </div>
      </div>
    </motion.section>
  );
}
