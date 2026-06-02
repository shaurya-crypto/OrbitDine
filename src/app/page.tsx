import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { ProblemStorySection } from "@/components/landing/ProblemStorySection";
import { JourneySection } from "@/components/landing/JourneySection";
import { DeviceShowcase } from "@/components/landing/DeviceShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-base relative selection:bg-accent/30 selection:text-text-primary">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProblemStorySection />
      <JourneySection />
      <DeviceShowcase />
      <FeaturesSection />
      <AnalyticsPreview />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
