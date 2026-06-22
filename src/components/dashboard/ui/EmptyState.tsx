"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6 px-4" : "py-10 px-6"}`}>
      <div className="w-12 h-12 rounded-2xl bg-text-primary/5 flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-tertiary" />
      </div>
      <h3 className="text-card-title text-text-primary mb-1">{title}</h3>
      <p className="text-caption text-text-secondary max-w-xs">{description}</p>
      
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-4 py-2 bg-accent text-white rounded-xl text-[13px] font-medium hover:bg-accent/90 transition-colors min-h-[44px]"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-text-secondary hover:text-text-primary text-[13px] font-medium transition-colors min-h-[44px]"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
