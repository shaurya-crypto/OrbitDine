"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import React from "react";

interface ComparisonTableProps {
  competitorName: string;
}

export function ComparisonTable({ competitorName }: ComparisonTableProps) {
  const comparisonData = [
    {
      feature: "Hardware Independence",
      orbitdine: "Runs on any device (iPad, Android, Web)",
      competitor: "Often requires proprietary, expensive hardware",
      orbitdineWins: true,
    },
    {
      feature: "Setup Speed",
      orbitdine: "Instant setup. No installation required.",
      competitor: "Can take weeks for hardware delivery and setup.",
      orbitdineWins: true,
    },
    {
      feature: "QR Ordering Experience",
      orbitdine: "App-less, frictionless, instant-loading.",
      competitor: "Clunky UI, sometimes requires app downloads.",
      orbitdineWins: true,
    },
    {
      feature: "Kitchen Display System (KDS)",
      orbitdine: "Real-time sync. Works on standard tablets.",
      competitor: "Requires expensive dedicated KDS screens.",
      orbitdineWins: true,
    },
    {
      feature: "Pricing Model",
      orbitdine: "Transparent SaaS pricing (Add your details here).",
      competitor: "Hidden fees, high transaction cuts.",
      orbitdineWins: true,
    }
  ];

  return (
    <section className="py-24 bg-base relative z-10 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-text-primary mb-6">
            OrbitDine vs. {competitorName}
          </h2>
          <p className="text-text-secondary text-lg">
            See why modern restaurants are switching to OrbitDine for faster operations and lower costs.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border bg-surface/50 backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="p-6 font-semibold text-text-primary w-1/3">Features</th>
                <th className="p-6 font-semibold text-accent w-1/3 border-l border-border">
                  OrbitDine
                </th>
                <th className="p-6 font-semibold text-text-secondary w-1/3 border-l border-border">
                  {competitorName}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="p-6 text-text-primary font-medium">{row.feature}</td>
                  <td className="p-6 border-l border-border bg-accent/5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-text-primary">{row.orbitdine}</span>
                    </div>
                  </td>
                  <td className="p-6 border-l border-border">
                    <div className="flex items-start gap-3 opacity-60">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{row.competitor}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
