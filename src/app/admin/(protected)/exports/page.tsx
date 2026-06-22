"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Download, FileJson, FileSpreadsheet, Loader2, Database, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminExportsPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const toast = useToast();

  const handleExport = async (type: string, format: "csv" | "json") => {
    setExporting(`${type}-${format}`);
    toast.success(`Started export for ${type}...`);
    
    // Trigger download via browser navigation to our streaming endpoint
    window.location.href = `/api/admin/exports?type=${type}&format=${format}`;
    
    // Clear the loading state shortly after triggering the download
    setTimeout(() => {
      setExporting(null);
    }, 2000);
  };

  const EXPORTS = [
    {
      id: "restaurants",
      title: "Restaurants & Menus",
      description: "Export all active restaurants, their menus, and basic settings.",
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "users",
      title: "Users & Customers",
      description: "Export full user directory including owners, staff, and customers.",
      icon: Database,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "orders",
      title: "Order History",
      description: "Export global order history. Warning: Very large dataset.",
      icon: Database,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "audit-logs",
      title: "Security Audit Logs",
      description: "Export immutable audit logs of all admin actions for compliance.",
      icon: ShieldAlert,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  return (
    <div className="p-4 md:p-8 pb-20 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">Data Exports</h1>
        <p className="text-zinc-400 text-sm md:text-base">Securely export platform data for analytics and compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPORTS.map((exp) => {
          const Icon = exp.icon;
          return (
            <GlassPanel key={exp.id} className="p-6 border-zinc-800/50 bg-zinc-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${exp.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${exp.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{exp.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-6 min-h-[40px]">
                  {exp.description}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zinc-800/50">
                <button
                  onClick={() => handleExport(exp.id, "csv")}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting === `${exp.id}-csv` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport(exp.id, "json")}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting === `${exp.id}-json` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileJson className="w-4 h-4" />
                  )}
                  Export JSON
                </button>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
