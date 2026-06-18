"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const LinkedInLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const founders = [
  {
    id: "prabh",
    name: "Prabh",
    role: "Co-Founder & CEO",
    mission: "Visioning the future of dining experiences.",
    specialization: "Strategy • Growth • Leadership",
    lightImage: "/founders/prabh_light.png",
    darkImage: "/founders/prabh_dark.png",
  },
  {
    id: "shaurya",
    name: "Shaurya",
    role: "Co-Founder & CTO",
    mission: "Building the operating system for modern restaurants.",
    specialization: "Product • Engineering • AI",
    lightImage: "/founders/shaurya_light.png",
    darkImage: "/founders/shaurya_dark.png",
  },
  {
    id: "agustus",
    name: "Agustus",
    role: "Co-Founder & CPO",
    mission: "Crafting intuitive products for complex operations.",
    specialization: "Design • Product • Experience",
    lightImage: "/founders/agustus_light.png",
    darkImage: "/founders/agustus_dark.png",
  },
];

const DesktopFounderCard = ({
  founder,
  index,
  progress,
  isDark,
  onClick,
}: {
  founder: typeof founders[0];
  index: number;
  progress: any;
  isDark: boolean;
  onClick: () => void;
}) => {
  // We have 4 phases: 0, 0.25, 0.5, 0.75, 1.0
  // Founder 1 active around 0.125
  // Founder 2 active around 0.375
  // Founder 3 active around 0.625
  // CTA active around 0.875
  
  const centerPoint = index * 0.25 + 0.125;
  const startPoint = Math.max(0, centerPoint - 0.25);
  const endPoint = Math.min(1, centerPoint + 0.25);

  const isActive = useTransform(progress, [startPoint, centerPoint, endPoint], [0, 1, 0]);
  
  // Transform values based on active state
  // Active: scale 1.08, z-index 30
  // Inactive (Before/After): scale < 1, z-index lower, opacity 0.35
  
  // Scale mapping: When active it's 1.08. When waiting it's 0.96 (next) or 0.88 (last).
  // Let's use a simpler approach: Just map the scroll progress directly.
  
  const scale = useTransform(
    progress,
    [startPoint, centerPoint, endPoint],
    [0.96, 1.08, 0.96]
  );

  const opacity = useTransform(
    progress,
    [startPoint, centerPoint - 0.1, centerPoint, centerPoint + 0.1, endPoint],
    [0.35, 1, 1, 1, 0.35]
  );
  
  const filter = useTransform(
    progress,
    [startPoint, centerPoint - 0.1, centerPoint, centerPoint + 0.1, endPoint],
    ["blur(16px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(16px)"]
  );
  
  const y = useTransform(
    progress,
    [startPoint, centerPoint, endPoint],
    [60, 0, -60]
  );
  
  const zIndexRaw = useTransform(
    progress,
    [startPoint, centerPoint, endPoint],
    [10, 30, 20]
  );
  const zIndex = useTransform(zIndexRaw, (v: number) => Math.round(v));

  const pointerEvents = useTransform(progress, (v: number) => {
    return v > startPoint + 0.05 && v < endPoint - 0.05 ? "auto" : "none";
  });

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      style={{
        scale,
        opacity,
        y,
        zIndex,
        rotateX,
        rotateY,
        filter,
        pointerEvents
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div 
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto w-full max-w-6xl mx-auto h-[600px] lg:h-[750px] xl:h-[850px] flex items-stretch gap-8 bg-surface dark:bg-surface-dark border border-border p-4 rounded-[32px] glass-panel transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1.5 hover:shadow-2xl hover:border-accent/50 group cursor-pointer"
      >
        
        {/* Left Side: Image (65%) */}
        <div className="w-[65%] h-full relative rounded-[24px] overflow-hidden bg-base group-hover:brightness-105 group-hover:contrast-105 transition-all duration-500">
          <Image
            src={isDark ? founder.darkImage : founder.lightImage}
            alt={founder.name}
            fill
            className="object-cover object-center lg:object-top"
            sizes="(max-width: 1200px) 65vw, 800px"
            priority={index === 0}
          />
        </div>

        {/* Right Side: Info (35%) */}
        <div className="w-[35%] py-8 pr-8 flex flex-col justify-center">
          <motion.div className="flex flex-col gap-6" style={{ opacity: isActive }}>
            <div>
              <h3 className="text-4xl font-serif tracking-tight text-text-primary mb-2">
                {founder.name}
              </h3>
              <div className="flex items-center gap-4">
                <p className="text-accent font-medium text-lg">{founder.role}</p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-full bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                    <LinkedInLogo className="w-5 h-5 text-[#0077b5] dark:text-[#0a66c2]" />
                  </div>
                  <div className="p-2 rounded-full bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                    <InstagramLogo className="w-5 h-5 text-[#E1306C]" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-2xl text-text-primary font-medium leading-tight">
              "{founder.mission}"
            </p>
            
            <div className="mt-auto">
              <p className="text-text-secondary text-sm font-mono tracking-widest uppercase">
                {founder.specialization}
              </p>
            </div>
          </motion.div>
        </div>
        
      </div>
    </motion.div>
  );
};

const MobileFounderCard = ({
  founder,
  index,
  isDark,
  onClick,
}: {
  founder: typeof founders[0];
  index: number;
  isDark: boolean;
  onClick: () => void;
}) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col w-full bg-surface dark:bg-surface-dark border border-border rounded-[32px] overflow-hidden glass-panel snap-center mb-6 cursor-pointer active:scale-[0.98] transition-transform p-6 sm:p-8"
    >
      <div className="flex items-center gap-5 sm:gap-6 mb-6">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 border border-border bg-base">
          <Image
            src={isDark ? founder.darkImage : founder.lightImage}
            alt={founder.name}
            fill
            className="object-cover object-top"
            sizes="128px"
            priority={index === 0}
          />
        </div>
        <div>
          <h3 className="text-3xl font-serif tracking-tight text-text-primary mb-1">
            {founder.name}
          </h3>
          <p className="text-accent font-medium text-sm sm:text-base">{founder.role}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="p-1.5 rounded-full bg-text-secondary/5">
              <LinkedInLogo className="w-4 h-4 text-[#0077b5] dark:text-[#0a66c2]" />
            </div>
            <div className="p-1.5 rounded-full bg-text-secondary/5">
              <InstagramLogo className="w-4 h-4 text-[#E1306C]" />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-xl sm:text-2xl text-text-primary font-medium leading-tight mb-4">
          "{founder.mission}"
        </p>
        <p className="text-text-secondary text-xs font-mono tracking-widest uppercase">
          {founder.specialization}
        </p>
      </div>
    </div>
  );
};

const ProgressRail = ({ progress }: { progress: any }) => {
  const steps = [
    { label: "01 Prabh", threshold: 0.125 },
    { label: "02 Shaurya", threshold: 0.375 },
    { label: "03 Agustus", threshold: 0.625 },
    { label: "04 Vision", threshold: 0.875 },
  ];

  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-50">
      {steps.map((step, i) => {
        const isActive = useTransform(
          progress,
          [step.threshold - 0.1, step.threshold, step.threshold + 0.1],
          [0.3, 1, 0.3]
        );
        
        return (
          <motion.div key={i} className="flex items-center gap-4" style={{ opacity: isActive }}>
            <div className="w-1 h-8 rounded-full bg-text-secondary/30 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-accent"
                style={{
                  scaleY: useTransform(
                    progress,
                    [Math.max(0, step.threshold - 0.15), step.threshold],
                    [0, 1]
                  ),
                  transformOrigin: "top"
                }}
              />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest whitespace-nowrap text-text-primary">
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const FounderShowcase = () => {
  const [selectedFounder, setSelectedFounder] = useState<typeof founders[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Bypass WAAPI ScrollTimeline by piping through a spring.
  // This evaluates the transform on the JS thread, preventing the "Offsets must be monotonically non-decreasing"
  // error caused by WAAPI strict [0, 1] bounds for keyframe offsets.
  const smoothProgress = useSpring(scrollYProgress, { bounce: 0, duration: 0 });

  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // CTA Animations
  const ctaOpacity = useTransform(smoothProgress, [0.7, 0.85], [0, 1]);
  const ctaY = useTransform(smoothProgress, [0.7, 0.85], [40, 0]);
  const ctaScale = useTransform(smoothProgress, [0.7, 0.85], [0.9, 1]);

  // If not mounted yet, we can render a placeholder or just light theme to avoid hydration mismatch,
  // but standard Next-themes pattern is to render nothing or light theme. 
  // Let's just render assuming light initially, it will snap to dark if needed.
  const safeIsDark = mounted ? isDark : false;

  return (
    <section className="relative w-full bg-base">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: "linear-gradient(180deg, #080808 0%, #141414 50%, #080808 100%)" }} 
      />
      <div className="absolute inset-0 pointer-events-none block dark:hidden"
        style={{ background: "linear-gradient(180deg, #F6F3ED 0%, #FFFFFF 50%, #F6F3ED 100%)" }}
      />

      {/* Desktop View (md+) */}
      <div ref={containerRef} className="hidden md:block h-[500vh] relative">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1000px]">
          
          <ProgressRail progress={smoothProgress} />

          {/* Founders */}
          {founders.map((founder, i) => (
            <DesktopFounderCard 
              key={founder.id}
              founder={founder}
              index={i}
              progress={smoothProgress}
              isDark={safeIsDark}
              onClick={() => setSelectedFounder(founder)}
            />
          ))}

          {/* Final CTA Stage */}
          <motion.div 
            style={{ opacity: ctaOpacity, y: ctaY, scale: ctaScale, zIndex: 40 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="max-w-3xl text-center px-4">
              <h2 className="text-5xl md:text-6xl font-serif text-text-primary leading-tight tracking-tight mb-8 drop-shadow-lg">
                Built by founders who believe restaurants deserve better technology.
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto drop-shadow-md">
                From QR ordering to analytics, every OrbitDine feature is designed to help restaurants grow faster.
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Mobile View (Stacked Cards, Snap Scrolling) */}
      <div className="md:hidden flex flex-col px-4 py-24 gap-8 snap-y snap-mandatory relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-text-primary mb-4">Our Founders</h2>
          <p className="text-text-secondary">The team building OrbitDine.</p>
        </div>
        
        {founders.map((founder, i) => (
          <MobileFounderCard 
            key={founder.id}
            founder={founder}
            index={i}
            isDark={safeIsDark}
            onClick={() => setSelectedFounder(founder)}
          />
        ))}

        <div className="snap-center pt-16 pb-8 text-center flex flex-col items-center">
           <h2 className="text-4xl font-serif text-text-primary leading-tight tracking-tight mb-6">
            Restaurants deserve better technology.
          </h2>
          <p className="text-lg text-text-secondary">
            Every OrbitDine feature is designed to help restaurants grow faster.
          </p>
        </div>
      </div>

      {/* Founder Details Modal */}
      <AnimatePresence>
        {selectedFounder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedFounder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface dark:bg-surface-dark border border-border rounded-[32px] p-8 max-w-2xl w-full relative"
            >
              <button 
                onClick={() => setSelectedFounder(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-text-secondary/10 transition-colors text-text-primary"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-border">
                  <Image 
                    src={safeIsDark ? selectedFounder.darkImage : selectedFounder.lightImage} 
                    alt={selectedFounder.name} 
                    fill 
                    className="object-cover object-top" 
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-serif text-text-primary mb-1">{selectedFounder.name}</h3>
                  <p className="text-accent font-medium mb-4">{selectedFounder.role}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                      <LinkedInLogo className="w-5 h-5 text-[#0077b5] dark:text-[#0a66c2]" /> LinkedIn
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                      <InstagramLogo className="w-5 h-5 text-[#E1306C]" /> Instagram
                    </a>
                  </div>
                  
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>Detailed biography and founder data will be placed here.</p>
                    <p>This expands on {selectedFounder.name}'s mission: "{selectedFounder.mission}"</p>
                    <p className="text-xs font-mono uppercase tracking-widest mt-6">Specialization: {selectedFounder.specialization}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
