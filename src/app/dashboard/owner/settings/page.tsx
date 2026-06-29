"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/ui/SectionHeader";
import { Bell, Database, HardDriveDownload, ChevronRight, CreditCard } from "lucide-react";

export default function OwnerSettingsHub() {
  const settingsLinks = [
    {
      title: "Notification Preferences",
      description: "Manage how and when you receive alerts for orders, staff, and system events.",
      icon: <Bell size={24} className="text-blue-500" />,
      href: "/dashboard/owner/settings/notifications",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Data Exports (CSV/JSON)",
      description: "Download raw, openable files (like Excel CSV) for your restaurant's orders, reviews, and menu.",
      icon: <HardDriveDownload size={24} className="text-emerald-500" />,
      href: "/dashboard/owner/settings/exports",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Enterprise Backups",
      description: "Generate complete JSON.gz disaster recovery snapshots of your entire restaurant footprint.",
      icon: <Database size={24} className="text-purple-500" />,
      href: "/dashboard/owner/settings/backups",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionHeader 
        title="Settings & Management" 
        subtitle="Configure your restaurant's preferences, data preservation, and security." 
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-4">
        {settingsLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <div className="card p-6 flex items-center justify-between hover:border-accent/40 transition-colors group cursor-pointer">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bgColor}`}>
                  {link.icon}
                </div>
                <div>
                  <h3 className="text-card-title text-text-primary group-hover:text-accent transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-caption text-text-secondary mt-1 max-w-xl">
                    {link.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0" size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
