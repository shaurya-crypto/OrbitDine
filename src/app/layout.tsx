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
  title: "OrbitDine | The Future of Dining",
  description: "A premium restaurant operating system.",
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
