import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, '../src/app');

const pages = [
  {
    path: 'restaurant-qr-ordering-system',
    title: 'Restaurant QR Ordering System',
    desc: 'Boost sales and reduce wait times with OrbitDine\\'s seamless Restaurant QR Ordering System. Zero hardware required.',
    h1: '<>The Ultimate<br />Restaurant QR Ordering System</>',
    sub: 'Let your guests scan, order, and pay directly from their phones. No app downloads required.'
  },
  {
    path: 'digital-menu-software',
    title: 'Digital Menu Software',
    desc: 'Create beautiful, dynamic digital menus for your restaurant. Update 86\\'d items and prices instantly across all tables.',
    h1: '<>Dynamic<br />Digital Menu Software</>',
    sub: 'Say goodbye to printing costs. Update your menu in real-time, highlight high-margin items, and increase average ticket size.'
  },
  {
    path: 'kitchen-display-system',
    title: 'Kitchen Display System (KDS)',
    desc: 'Streamline your back-of-house operations with a lightning-fast Kitchen Display System. Connect front-of-house to the kitchen instantly.',
    h1: '<>Lightning-Fast<br />Kitchen Display System</>',
    sub: 'Ditch the paper tickets. Route orders directly to the right stations, track prep times, and never lose an order again.'
  },
  {
    path: 'restaurant-analytics',
    title: 'Restaurant Analytics & Reporting',
    desc: 'Make data-driven decisions with real-time restaurant analytics. Track sales, table turnover, and staff performance from anywhere.',
    h1: '<>Real-Time<br />Restaurant Analytics</>',
    sub: 'Stop guessing. Monitor your restaurant\\'s heartbeat from your phone with actionable insights and detailed reporting.'
  },
  {
    path: 'restaurant-management-software',
    title: 'Restaurant Management Software',
    desc: 'The complete restaurant management software built for speed. Handle orders, kitchen workflows, and analytics in one place.',
    h1: '<>The Complete<br />Restaurant Management Software</>',
    sub: 'One platform to rule them all. OrbitDine gives you everything you need to run your restaurant efficiently without the bloat.'
  },
  {
    path: 'restaurant-pos-alternative',
    title: 'Restaurant POS Alternative',
    desc: 'Looking for a Restaurant POS alternative? OrbitDine offers zero hardware lock-in, low fees, and modern features.',
    h1: '<>The Modern<br />Restaurant POS Alternative</>',
    sub: 'Why pay thousands for clunky hardware? OrbitDine runs on any tablet or phone, giving you total freedom and lower operational costs.'
  }
];

pages.forEach(p => {
  const dir = path.join(appDir, p.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const content = `import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "${p.title} | OrbitDine",
  description: "${p.desc}",
  alternates: { canonical: "/${p.path}" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-base relative">
      <Navbar />
      <HeroSection 
        title={${p.h1}} 
        subtitle="${p.sub}"
      />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});
console.log("Revenue pages generated!");
