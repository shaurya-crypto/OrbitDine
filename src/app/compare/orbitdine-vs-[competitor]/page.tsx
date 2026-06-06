import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

const COMPETITORS = ["petpooja", "dotpe", "toast", "gloriafood"];

const formatCompetitorName = (slug: string) => {
  switch (slug.toLowerCase()) {
    case "petpooja": return "Petpooja";
    case "dotpe": return "DotPe";
    case "toast": return "Toast";
    case "gloriafood": return "GloriaFood";
    default: return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
};

export async function generateStaticParams() {
  return COMPETITORS.map((competitor) => ({
    competitor: competitor,
  }));
}

export async function generateMetadata({ params }: { params: { competitor: string } }): Promise<Metadata> {
  const { competitor } = await params;
  
  if (!COMPETITORS.includes(competitor.toLowerCase())) {
    return {};
  }

  const name = formatCompetitorName(competitor);

  return {
    title: `OrbitDine vs. ${name} | The Modern Restaurant POS Alternative`,
    description: `Looking for a ${name} alternative? See why OrbitDine's seamless QR ordering, KDS, and zero hardware lock-in make it the best choice for modern restaurants.`,
    alternates: { canonical: `/compare/orbitdine-vs-${competitor}` },
  };
}

export default async function ComparisonPage({ params }: { params: { competitor: string } }) {
  const { competitor } = await params;

  if (!COMPETITORS.includes(competitor.toLowerCase())) {
    notFound();
  }

  const name = formatCompetitorName(competitor);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OrbitDine",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": `OrbitDine is a superior alternative to ${name}, offering zero hardware lock-in, faster setup times, and modern restaurant management features.`
  };

  return (
    <main className="min-h-screen bg-base relative">
      <SchemaMarkup schema={softwareSchema} />
      <Navbar />
      <HeroSection 
        title={<>OrbitDine vs. <span className="text-text-secondary line-through">{name}</span></>} 
        subtitle={`Don't get locked into expensive hardware or hidden fees. See why restaurants are switching from ${name} to OrbitDine's modern, hardware-independent operating system.`}
      />
      <ComparisonTable competitorName={name} />
      <CTASection />
      <Footer />
    </main>
  );
}
