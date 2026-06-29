"use client";

import { useState } from "react";
import { FileDown, Download, CheckCircle2, ChevronRight, FileJson, FileSpreadsheet, Loader2, HardDriveDownload } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function OwnerExportsPage() {
  const { restaurantId } = useAuthStore();
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleExport = (type: string, format: "csv" | "json") => {
    if (!restaurantId) {
      alert("Restaurant ID not found. Please log in again.");
      return;
    }
    setExportingType(`${type}-${format}`);
    
    // Natively trigger download so browser handles the stream, preventing RAM crash
    window.location.href = `/api/owner/exports?type=${type}&format=${format}&restaurantId=${restaurantId}`;
    
    // Clear loading state after a few seconds assuming download started
    setTimeout(() => {
      setExportingType(null);
    }, 3000);
  };

  const exportModules = [
    {
      id: "orders",
      title: "Order Ledger",
      description: "Export all historical order data, totals, and statuses.",
      icon: <HardDriveDownload className="text-emerald-500" size={24} />
    },
    {
      id: "reviews",
      title: "Customer Reviews",
      description: "Export all feedback, star ratings, and moderation statuses.",
      icon: <HardDriveDownload className="text-blue-500" size={24} />
    },
    {
      id: "menu",
      title: "Menu Items",
      description: "Export your entire menu catalog with pricing and availability.",
      icon: <HardDriveDownload className="text-orange-500" size={24} />
    },
    {
      id: "customers",
      title: "Customer Profiles",
      description: "Export loyalty data, predicted churn, and LTV metrics for users.",
      icon: <HardDriveDownload className="text-purple-500" size={24} />
    },
    {
      id: "sessions",
      title: "Table Sessions",
      description: "Export table QR sessions with order counts and totals.",
      icon: <HardDriveDownload className="text-pink-500" size={24} />
    },
    {
      id: "analytics",
      title: "Analytics Events",
      description: "Export raw click, view, and engagement events for custom BI.",
      icon: <HardDriveDownload className="text-indigo-500" size={24} />
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
          Data Exports
        </h1>
        <p className="text-text-secondary mt-2">
          Download your live data directly to an openable file format like Excel (CSV) or JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportModules.map((mod) => (
          <div key={mod.id} className="card p-6 flex flex-col justify-between space-y-6 hover:border-accent/30 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-surface rounded-xl border border-border">
                {mod.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary">{mod.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{mod.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <button
                onClick={() => handleExport(mod.id, "csv")}
                disabled={exportingType !== null}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                {exportingType === `${mod.id}-csv` ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                Export CSV
              </button>
              <button
                onClick={() => handleExport(mod.id, "json")}
                disabled={exportingType !== null}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all disabled:opacity-50"
              >
                {exportingType === `${mod.id}-json` ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
                Export JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
