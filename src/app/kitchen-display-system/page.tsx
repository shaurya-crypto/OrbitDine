import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Kitchen Display System (KDS) | OrbitDine",
  description: "Streamline your back-of-house operations with a lightning-fast Kitchen Display System. Connect FOH to the kitchen instantly.",
  alternates: { canonical: "/kitchen-display-system" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>Lightning-Fast<br />Kitchen Display System</>} 
        subtitle="Ditch the paper tickets. Route orders directly to the right stations, track prep times, and never lose an order again."
      />
      <FeaturesSection title={<>Perfect Workflow.<br />Every Order.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
