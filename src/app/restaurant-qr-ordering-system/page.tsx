import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Restaurant QR Ordering System | OrbitDine",
  description: "Boost sales and reduce wait times with OrbitDine's seamless Restaurant QR Ordering System. Zero hardware required.",
  alternates: { canonical: "/restaurant-qr-ordering-system" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>The Ultimate<br />Restaurant QR Ordering System</>} 
        subtitle="Let your guests scan, order, and pay directly from their phones. No app downloads required."
      />
      <FeaturesSection title={<>Built for Speed.<br />Designed for Restaurants.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
