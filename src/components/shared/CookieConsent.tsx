"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already set cookie preferences
    const cookieConsent = localStorage.getItem("orbitdine_cookie_consent");
    if (!cookieConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "orbitdine_cookie_consent", 
      JSON.stringify({ necessary: true, analytics: true, marketing: true })
    );
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem(
      "orbitdine_cookie_consent", 
      JSON.stringify({ necessary: true, analytics: false, marketing: false })
    );
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    // Basic stub - assume form state here in a real complex implementation
    localStorage.setItem(
      "orbitdine_cookie_consent", 
      JSON.stringify({ necessary: true, analytics: false, marketing: false }) // Default to strict if they don't use real checkboxes
    );
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] md:max-w-md"
        >
          <div className="bg-base/60 backdrop-blur-2xl p-5 md:p-6 rounded-2xl shadow-2xl border border-border/50">
            {!showPreferences ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Cookie className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-1 md:mb-2">We value your privacy</h3>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button 
                    onClick={handleAcceptAll}
                    className="w-full bg-text-primary text-base text-surface font-medium rounded-xl py-2.5 md:py-3 hover:bg-text-primary/90 transition-colors"
                  >
                    Accept All
                  </button>
                  <div className="flex gap-2.5">
                    <button 
                      onClick={handleRejectAll}
                      className="w-1/2 bg-surface/50 border border-border/50 text-text-primary text-sm font-medium rounded-xl py-2 hover:bg-border/30 transition-colors"
                    >
                      Reject All
                    </button>
                    <button 
                      onClick={() => setShowPreferences(true)}
                      className="w-1/2 bg-surface/50 border border-border/50 text-text-primary text-sm font-medium rounded-xl py-2 hover:bg-border/30 transition-colors"
                    >
                      Preferences
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text-primary">Cookie Preferences</h3>
                  <button onClick={() => setShowPreferences(false)} className="text-text-secondary hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">Strictly Necessary</div>
                      <div className="text-xs text-text-secondary">These cookies are required for the website to function and cannot be switched off.</div>
                    </div>
                    <input type="checkbox" checked disabled className="mt-1" />
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">Analytics</div>
                      <div className="text-xs text-text-secondary">Helps us understand how visitors interact with the website.</div>
                    </div>
                    <input type="checkbox" defaultChecked className="mt-1 accent-accent" />
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">Marketing</div>
                      <div className="text-xs text-text-secondary">Used to deliver advertisements more relevant to you and your interests.</div>
                    </div>
                    <input type="checkbox" className="mt-1 accent-accent" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSavePreferences}
                    className="w-full bg-text-primary text-base text-surface font-medium rounded-xl py-3 hover:bg-text-primary/90 transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button 
                    onClick={handleAcceptAll}
                    className="w-full text-text-secondary text-sm font-medium py-2 hover:text-text-primary transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
