"use client";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  premium?: boolean;
  interactive?: boolean;
  depth?: number;
}

export function GlassPanel({ 
  children, 
  className = "", 
  premium = false, 
}: GlassPanelProps) {
  const glassClass = premium ? "glass-panel-premium" : "glass-panel";

  return (
    <div className={`rounded-2xl overflow-hidden relative ${glassClass} ${className}`}>
      {children}
    </div>
  );
}
