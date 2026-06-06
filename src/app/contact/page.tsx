import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";

export const metadata: Metadata = {
  title: "Contact OrbitDine | Enterprise Restaurant Software",
  description: "Get in touch with the OrbitDine team. Learn how our restaurant management software and KDS can scale your operations.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OrbitDine Support",
    "url": "https://orbit-dine-zeta.vercel.app/contact"
  };

  return (
    <main className="min-h-screen bg-base relative flex flex-col">
      <SchemaMarkup schema={localBusinessSchema} />
      <Navbar />
      <div className="flex-1 pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-text-primary mb-6">Let's Talk</h1>
          <p className="text-text-secondary text-lg mb-12">
            Have questions about scaling your restaurant with OrbitDine? Our team is ready to help you optimize your kitchen display system and QR ordering.
          </p>
          <div className="bg-surface/50 border border-border p-8 rounded-3xl backdrop-blur-md text-left">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Restaurant Name</label>
                <input type="text" className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input type="email" className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                <textarea rows={4} className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent"></textarea>
              </div>
              <button type="button" className="w-full bg-text-primary text-base font-medium py-4 rounded-xl hover:bg-zinc-200 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
