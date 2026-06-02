"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does QR ordering work?",
    a: "Guests scan a custom-branded QR code on their table using their smartphone camera. This instantly opens your digital menu—no app download required. They can browse, customize, and send their order directly to your kitchen."
  },
  {
    q: "Can it work offline?",
    a: "Our core system requires an internet connection to sync orders in real-time. However, we have a lightweight offline mode that queues orders locally and automatically pushes them to the kitchen once connection is restored."
  },
  {
    q: "How many tables are supported?",
    a: "Unlimited. Whether you run a cozy 5-table cafe or a sprawling 200-table multi-floor establishment, OrbitDine scales effortlessly without performance drops."
  },
  {
    q: "Can menus be customized?",
    a: "Absolutely. You have full control over colors, typography, imagery, and layout. Update items, prices, and 86 ingredients in real-time across all active sessions."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-12 text-center">
          Common Questions.
        </h2>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-base border border-border rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex items-center justify-between p-6">
                <h3 className="text-lg font-medium text-text-primary pr-8">{faq.q}</h3>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                </motion.div>
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-text-secondary">
                      <p>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
