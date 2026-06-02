"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePerformance } from "./PerformanceProvider";
// import gsap from "react-gsap"; // wait, usually we just use gsap directly
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsapInstance from "gsap";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLowEndMode } = usePerformance();

  useEffect(() => {
    if (isLowEndMode) return; // Disable Lenis on low-end devices

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // default, can use power4 or similar
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.6,
      touchMultiplier: 1.8,
    });

    gsapInstance.registerPlugin(ScrollTrigger);

    lenis.on("scroll", ScrollTrigger.update);

    gsapInstance.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsapInstance.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsapInstance.ticker.remove(lenis.raf);
    };
  }, [isLowEndMode]);

  return <>{children}</>;
}
