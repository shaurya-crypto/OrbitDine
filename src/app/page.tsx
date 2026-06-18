import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
// import { RestaurantOperationsSection } from "@/components/landing/RestaurantOperationsSection";
import { ProblemStorySection } from "@/components/landing/ProblemStorySection";
import { JourneySection } from "@/components/landing/JourneySection";
import { DeviceShowcase } from "@/components/landing/DeviceShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LiveInsightsSection } from "@/components/landing/LiveInsightsSection";
import { RolesSection } from "@/components/landing/RolesSection";
import { WhyOrbitDineSection } from "@/components/landing/WhyOrbitDineSection";
import { TrainingSection } from "@/components/landing/TrainingSection";
import { PartnerSection } from "@/components/landing/PartnerSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { FounderShowcase } from "@/components/landing/FounderShowcase";
import { Footer } from "@/components/shared/Footer";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OrbitDine",
    "url": "https://orbit-dine-zeta.vercel.app",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OrbitDine",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "featureList": [
      "QR Ordering",
      "Digital Menu",
      "Kitchen Display System",
      "Staff Dashboard",
      "Analytics"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is OrbitDine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OrbitDine is a comprehensive restaurant management software featuring a QR ordering system, digital menu, kitchen display system (KDS), and real-time analytics."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-base relative selection:bg-accent/30 selection:text-text-primary">
      <SchemaMarkup schema={organizationSchema} />
      <SchemaMarkup schema={softwareSchema} />
      <SchemaMarkup schema={faqSchema} />
      <Navbar />
      <HeroSection />
      <ProblemStorySection />
      <JourneySection />
      <FeaturesSection />
      <WhyOrbitDineSection />
      {/* <LiveInsightsSection /> */}
      <FounderShowcase />
      <PartnerSection />
      <FAQSection />
      {/* <CTASection /> */}
      <Footer />
    </main>
  );
}
