import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Restaurant Analytics & Reporting | OrbitDine",
  description: "Make data-driven decisions with real-time restaurant analytics. Track sales, table turnover, and staff performance from anywhere.",
  alternates: { canonical: "/restaurant-analytics" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>Real-Time<br />Restaurant Analytics</>} 
        subtitle="Stop guessing. Monitor your restaurant's heartbeat from your phone with actionable insights and detailed reporting."
      />
      <FeaturesSection title={<>Deep Insights.<br />Simple Dashboards.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
