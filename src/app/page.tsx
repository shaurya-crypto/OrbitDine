import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
// import { RestaurantOperationsSection } from "@/components/landing/RestaurantOperationsSection";
import { ProblemStorySection } from "@/components/landing/ProblemStorySection";
import { JourneySection } from "@/components/landing/JourneySection";
import { DeviceShowcase } from "@/components/landing/DeviceShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LiveInsightsSection } from "@/components/landing/LiveInsightsSection";
import { RolesSection } from "@/components/landing/RolesSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { WhyOrbitDineSection } from "@/components/landing/WhyOrbitDineSection";
import { TrainingSection } from "@/components/landing/TrainingSection";
import { PartnerSection } from "@/components/landing/PartnerSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-base relative selection:bg-accent/30 selection:text-text-primary">
      <Navbar />
      <HeroSection />
      {/* <RestaurantOperationsSection /> */}
      <ProblemStorySection />
      <JourneySection />
      {/* <DeviceShowcase /> */}
      <FeaturesSection />
      {/* <LiveInsightsSection /> */}
      {/* <RolesSection /> */}
      {/* <CommunitySection /> */}
      <WhyOrbitDineSection />
      {/* <TrainingSection /> */}
      <PartnerSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
