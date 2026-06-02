"use client";

import { usePerformance } from "../providers/PerformanceProvider";

export function AnalyticsPreview() {
  const { isLowEndMode } = usePerformance();

  return (
    <section className="w-full py-24 md:py-32 bg-surface overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-soft rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif text-text-primary tracking-tight mb-6">
            Command Center.
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real-time insights across all your locations.
          </p>
        </div>

        <div className="relative w-full max-w-[1200px] mx-auto bg-base border border-border rounded-3xl p-6 md:p-10 shadow-2xl glass-panel z-10 overflow-hidden">
           {/* Top Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             {[
               { label: "Today's Revenue", val: "$4,250", change: "+12%" },
               { label: "Orders", val: "142", change: "+5%" },
               { label: "Avg Turn Time", val: "45m", change: "-8%" },
               { label: "Active Tables", val: "24/30", change: "" },
             ].map((stat, i) => (
               <div key={i} className="bg-surface p-4 rounded-xl border border-border">
                 <p className="text-sm font-mono text-text-secondary uppercase mb-2">{stat.label}</p>
                 <div className="flex items-end justify-between">
                   <p className="text-2xl font-medium text-text-primary">{stat.val}</p>
                   {stat.change && (
                     <span className={`text-sm ${stat.change.startsWith('+') ? 'text-accent' : 'text-text-primary'}`}>
                       {stat.change}
                     </span>
                   )}
                 </div>
               </div>
             ))}
           </div>

           {/* Main Chart Area */}
           <div className="w-full h-64 md:h-96 bg-surface border border-border rounded-xl mb-8 relative flex items-end p-8 gap-4">
              {!isLowEndMode && (
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
              )}
              {/* Fake bars */}
              {[40, 60, 45, 80, 50, 90, 75, 100, 85, 60, 110, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-accent/40 rounded-t-md hover:bg-accent/60 transition-colors cursor-pointer relative group" style={{ height: `${(h/110)*100}%` }}>
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono z-10">
                     ${h * 10}
                   </div>
                </div>
              ))}
           </div>

           {/* Live Orders Table */}
           <div className="w-full bg-surface border border-border rounded-xl overflow-hidden">
             <div className="grid grid-cols-4 px-6 py-4 border-b border-border text-sm font-mono text-text-secondary uppercase">
               <span>Table</span>
               <span>Status</span>
               <span>Items</span>
               <span className="text-right">Total</span>
             </div>
             {[
               { t: "12", s: "Preparing", i: "3", v: "$45.00" },
               { t: "04", s: "Ready", i: "2", v: "$32.50", hl: true },
               { t: "18", s: "Seated", i: "0", v: "$0.00" },
             ].map((row, i) => (
               <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-border/50 text-text-primary text-sm last:border-0 hover:bg-base transition-colors">
                 <span className="font-medium">T-{row.t}</span>
                 <span className={row.hl ? 'text-accent' : 'text-text-secondary'}>{row.s}</span>
                 <span>{row.i}</span>
                 <span className="text-right font-mono">{row.v}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
}
