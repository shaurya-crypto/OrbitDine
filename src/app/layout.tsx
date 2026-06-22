import type { Metadata } from "next";
import { Instrument_Serif, Outfit, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import CookieConsent from "@/components/shared/CookieConsent";
import { NetworkMonitor } from "@/components/shared/NetworkMonitor";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import Script from "next/script";
import { GoogleOAuthProvider } from "@react-oauth/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://orbitdine.com"),
  title: {
    default: "OrbitDine | Restaurant Management Software & QR Ordering",
    template: "%s | OrbitDine"
  },
  description: "Upgrade your restaurant with OrbitDine. The all-in-one QR digital menu, kitchen display system (KDS), and restaurant analytics platform.",
  verification: {
    google: "uqSaN1PAqxIBR2gBTnEA82cVKOVgtQadwekPAs78cbw",
  },
  openGraph: {
    title: "OrbitDine | Restaurant Management Software",
    description: "The complete operating system for modern restaurants. QR ordering, KDS, and analytics.",
    url: "/",
    siteName: "OrbitDine",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrbitDine | Restaurant Management Software",
    description: "The complete operating system for modern restaurants. QR ordering, KDS, and analytics.",
  },
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-TW55C35JV5`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src="/analytics.js"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${outfit.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Script
          id="pwa-sw-registration"
          strategy="afterInteractive"
          src="/register-sw.js"
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "MISSING_CLIENT_ID"}>
            <PerformanceProvider>
              <QueryProvider>
                <SmoothScrollProvider>
                  <ToastProvider>
                    <ConfirmProvider>
                      <NetworkMonitor />
                      {children}
                      <CookieConsent />
                    </ConfirmProvider>
                  </ToastProvider>
                </SmoothScrollProvider>
              </QueryProvider>
            </PerformanceProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
