import type { Metadata } from "next";
import { Instrument_Serif, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import CookieConsent from "@/components/shared/CookieConsent";
import { ConnectionBanner } from "@/components/shared/ConnectionBanner";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

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
    google: "42zDK7UJTTbpcRRTb9F8RsdROd0rrvOLvJSGuQM3qpw",
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${outfit.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <PerformanceProvider>
            <QueryProvider>
              <SmoothScrollProvider>
                <ToastProvider>
                  <ConfirmProvider>
                    <ConnectionBanner />
                    {children}
                    <CookieConsent />
                  </ConfirmProvider>
                </ToastProvider>
              </SmoothScrollProvider>
            </QueryProvider>
          </PerformanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
