import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

const CITIES = [
  "delhi", "mumbai", "bangalore", "hyderabad", "pune", 
  "chennai", "kolkata", "ahmedabad", "jaipur", "chandigarh"
];

// Helper to format city names nicely (e.g. "mumbai" -> "Mumbai")
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export async function generateStaticParams() {
  return CITIES.map((city) => ({
    city: city,
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const { city } = await params;
  
  if (!CITIES.includes(city.toLowerCase())) {
    return {};
  }

  const cityName = capitalize(city);

  return {
    title: `Restaurant POS & Management Software in ${cityName} | OrbitDine`,
    description: `Upgrade your restaurant in ${cityName} with OrbitDine's seamless QR ordering system, digital menu, and KDS. Zero hardware lock-in.`,
    alternates: { canonical: `/restaurant-software/${city}` },
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const { city } = await params;

  if (!CITIES.includes(city.toLowerCase())) {
    notFound();
  }

  const cityName = capitalize(city);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `OrbitDine ${cityName}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": `OrbitDine provides leading restaurant management software, POS alternatives, and QR ordering systems for restaurants in ${cityName}.`
  };

  return (
    <main className="min-h-screen bg-base relative">
      <SchemaMarkup schema={localBusinessSchema} />
      <Navbar />
      <HeroSection 
        title={<>The #1 Restaurant Software<br />in {cityName}</>} 
        subtitle={`Join top restaurants in ${cityName} using OrbitDine to increase table turnover, reduce wait times, and ditch clunky legacy POS hardware.`}
      />
      <FeaturesSection title={<>Everything your {cityName}<br />restaurant needs.</>} />
      <CTASection />
      <Footer />
    </main>
  );
}
