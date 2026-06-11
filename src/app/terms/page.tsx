"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base relative selection:bg-accent/30 selection:text-text-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-12">
        <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">Terms of Service</h1>
        <p className="text-text-secondary mb-12 border-b border-border pb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none text-text-secondary space-y-8">
          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OrbitDine's restaurant management platform, QR ordering systems, and KDS 
              (collectively, the "Service"), you agree to be bound by these Terms of Service. If you disagree 
              with any part of the terms, you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">2. Description of Service</h2>
            <p>
              OrbitDine provides cloud-based software for restaurant operations. This includes digital menus, 
              table management, real-time kitchen displays, and role-based staff dashboards. We reserve the 
              right to modify, suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">3. Accounts and Roles</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for safeguarding the password and access credentials for your account.</li>
              <li>Restaurant owners are responsible for managing staff roles and permissions within their organization.</li>
              <li>You must provide accurate, complete, and current information upon registration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process fraudulent or illegal transactions.</li>
              <li>Upload malicious code, viruses, or disruptive scripts.</li>
              <li>Interfere with the real-time websocket connections or abuse the API rate limits.</li>
              <li>Reverse engineer the proprietary restaurant operating system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">5. Limitation of Liability</h2>
            <p>
              In no event shall OrbitDine, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
              to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-text-primary mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any material 
              changes. By continuing to access or use our Service after those revisions become effective, you agree to be 
              bound by the revised terms.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
