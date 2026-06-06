import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Restaurant Management Software | OrbitDine",
  description: "The complete restaurant management software built for speed. Handle orders, kitchen workflows, and analytics in one place.",
  alternates: { canonical: "/restaurant-management-software" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>The Complete<br />Restaurant Management Software</>} 
        subtitle="One platform to rule them all. OrbitDine gives you everything you need to run your restaurant efficiently without the bloat."
      />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
