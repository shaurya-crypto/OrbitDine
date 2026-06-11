"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-base relative selection:bg-accent/30 selection:text-text-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-12">
        <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">Privacy Policy</h1>
        <p className="text-text-secondary mb-12 border-b border-border pb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none text-text-secondary space-y-8">
          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">1. Introduction</h2>
            <p>
              Welcome to OrbitDine. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and share information about you when you use our 
              restaurant management software, digital menus, and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect several different types of information for various purposes to provide and improve our Service to you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and Google OAuth profile information when you register an account.</li>
              <li><strong>Restaurant Data:</strong> Menu items, pricing, staff role assignments, and operational analytics.</li>
              <li><strong>Usage Data:</strong> Real-time session data, browser types, and interaction metrics gathered through our dashboard.</li>
              <li><strong>Customer Data:</strong> When patrons use the QR ordering system, we collect temporary session data to process orders.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Service, including real-time order synchronization via Pusher.</li>
              <li>To notify you about changes to our Service.</li>
              <li>To provide customer support and administrative assistance.</li>
              <li>To analyze usage patterns to improve our restaurant analytics and operational efficiency tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">4. Data Security</h2>
            <p>
              The security of your data is important to us. We use industry-standard security measures including 
              secure JWT authentication, bcrypt password hashing, and encrypted database connections to protect 
              your information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">5. Third-Party Services</h2>
            <p>
              We employ third-party companies (such as Google for OAuth, Cloudinary for image hosting, and Pusher for 
              real-time websockets) to facilitate our Service. These third parties have access to your Personal Data 
              only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@orbitdine.com.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
