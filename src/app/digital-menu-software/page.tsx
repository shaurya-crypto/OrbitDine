import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Digital Menu Software | OrbitDine",
  description: "Create beautiful, dynamic digital menus for your restaurant. Update items and prices instantly across all tables.",
  alternates: { canonical: "/digital-menu-software" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={<>Dynamic<br />Digital Menu Software</>} 
        subtitle="Say goodbye to printing costs. Update your menu in real-time, highlight high-margin items, and increase average ticket size."
      />
      <FeaturesSection title={<>Everything You Need.<br />Nothing You Don't.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
