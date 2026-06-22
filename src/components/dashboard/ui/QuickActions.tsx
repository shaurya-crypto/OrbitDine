"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "accent";
}

interface QuickActionsProps {
  actions: QuickAction[];
  label?: string;
}

export function QuickActions({ actions, label = "Actions" }: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 card text-[13px] font-medium text-text-primary hover:bg-hover transition-colors min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown size={14} className={`text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-elevated border border-border rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium transition-colors min-h-[44px] ${
                action.variant === "accent"
                  ? "text-accent hover:bg-accent-soft"
                  : "text-text-primary hover:bg-hover"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-text-secondary">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
