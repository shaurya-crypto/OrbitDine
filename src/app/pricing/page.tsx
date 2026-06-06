import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/shared/Footer";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

export const metadata: Metadata = {
  title: "OrbitDine Pricing | Transparent Plans for Restaurants",
  description: "View OrbitDine's pricing plans. Affordable restaurant management software with zero hidden fees. Scale from a single cafe to a franchise.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is there a free trial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, OrbitDine offers a fully-featured free tier so you can test our QR ordering and KDS before committing."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need custom hardware?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, OrbitDine has zero hardware lock-in. Our software runs on any iPad, Android tablet, or smartphone you already own."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-base relative">
      <SchemaMarkup schema={faqSchema} />
      <Navbar />
      <div className="pt-24">
        <PricingSection />
        <FAQSection />
      </div>
      <Footer />
    </main>
  );
}
