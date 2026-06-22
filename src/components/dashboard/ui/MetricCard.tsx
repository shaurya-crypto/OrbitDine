"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; label?: string }; // percentage change
  icon?: React.ReactNode;
  sparklineData?: number[];
  className?: string;
}

export function MetricCard({ label, value, trend, icon, sparklineData, className = "" }: MetricCardProps) {
  const trendColor = trend && trend.value >= 0 ? "text-emerald-500" : "text-red-400";
  const TrendIcon = trend && trend.value >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className={`card p-4 flex items-start justify-between gap-3 group ${className}`}>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-text-secondary truncate">{label}</p>
        <p className="text-metric-value text-text-primary mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 ${trendColor}`}>
            <TrendIcon size={12} />
            <span className="text-[11px] font-medium">
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-text-tertiary text-[11px]">{trend.label}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-3 flex-shrink-0">
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData} />
        )}
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-text-primary/5">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 64;
  const height = 28;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-accent"
      />
    </svg>
  );
}
