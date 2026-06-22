"use client";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 w-full ${className}`} />;
}

export function SkeletonMetric({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-4 flex flex-col gap-2.5 ${className}`}>
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-6 w-16" />
      <div className="skeleton h-3 w-12" />
    </div>
  );
}

export function SkeletonCard({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`card p-4 flex flex-col gap-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-4 p-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 p-3 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="skeleton h-3 flex-1" style={{ opacity: 0.5 + Math.random() * 0.5 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
