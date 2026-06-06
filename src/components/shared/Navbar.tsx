"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore, Role } from "@/stores/authStore";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Solutions", href: "#solutions" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { roles } = useAuthStore();
  const highestRole = roles && roles.length > 0 ? ((["owner", "manager", "staff", "kitchen", "customer"] as Role[]).find(r => roles.includes(r)) || "customer") : null;
  const logoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Scroll effect
  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      setScrolled(isScrolled);
      
      // Scale logo slightly on scroll using GSAP
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          scale: isScrolled ? 0.9 : 1,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Magnetic CTA
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Only magnetize if close
      const distance = Math.sqrt(x * x + y * y);
      if (distance < 100) {
        gsap.to(cta, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: "power2.out"
        });
      } else {
        gsap.to(cta, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(cta, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    cta.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cta.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled 
            ? "py-4 bg-base/80 border-b border-border shadow-sm" 
            : "py-6 bg-transparent border-b-transparent"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          
          <div ref={logoRef} className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-serif tracking-tight text-text-primary">
              Orbit<span className="text-accent">Dine</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="group relative text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-text-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            {isMounted && highestRole ? (
              <Link 
                ref={ctaRef}
                href={`/dashboard/${highestRole}`}
                className="px-6 py-2.5 bg-text-primary text-base text-sm font-medium rounded-full hover:scale-105 active:scale-95 transition-transform"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Login
                </Link>
                <Link 
                  ref={ctaRef}
                  href="/signup" 
                  className="px-6 py-2.5 bg-text-primary text-base text-sm font-medium rounded-full hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button 
              className="text-text-primary p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-base flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <Link href="/" className="text-2xl font-serif text-text-primary" onClick={() => setMobileMenuOpen(false)}>
                Orbit<span className="text-accent">Dine</span>
              </Link>
              <button className="p-2 text-text-primary" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center px-12 gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-4xl font-serif text-text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-col gap-4"
              >
                {isMounted && highestRole ? (
                  <Link href={`/dashboard/${highestRole}`} className="w-full py-4 text-center bg-text-primary text-base rounded-full font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="w-full py-4 text-center border border-border rounded-full text-text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <Link href="/signup" className="w-full py-4 text-center bg-text-primary text-base rounded-full font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
