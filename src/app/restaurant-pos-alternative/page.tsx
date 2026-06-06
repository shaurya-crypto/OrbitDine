import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Restaurant POS Alternative | OrbitDine",
  description: "Looking for a Restaurant POS alternative? OrbitDine offers zero hardware lock-in, low fees, and modern features.",
  alternates: { canonical: "/restaurant-pos-alternative" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>The Modern<br />Restaurant POS Alternative</>} 
        subtitle="Why pay thousands for clunky hardware? OrbitDine runs on any tablet or phone, giving you total freedom and lower operational costs."
      />
      <FeaturesSection title={<>Zero Hardware Lock-in.<br />Maximum Flexibility.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
