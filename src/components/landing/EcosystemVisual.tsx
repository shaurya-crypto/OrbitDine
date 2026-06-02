"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePerformance } from "@/components/providers/PerformanceProvider";
import { floatingVariant, glowPulseVariant } from "@/lib/design-system";
import {
  Smartphone,
  LayoutDashboard,
  LineChart,
  ChefHat,
  Crown,
  Gamepad2,
  Building2,
  Database
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const nodes = [
  { id: "customer", label: "Customer App", icon: Smartphone, angle: 0, distance: 240, color: "text-blue-400" },
  { id: "manager", label: "Manager Hub", icon: LayoutDashboard, angle: 51.4, distance: 200, color: "text-accent" },
  { id: "owner", label: "Owner View", icon: Building2, angle: 102.8, distance: 250, color: "text-purple-400" },
  { id: "kitchen", label: "Kitchen Ops", icon: ChefHat, angle: 154.2, distance: 220, color: "text-orange-400" },
  { id: "loyalty", label: "Loyalty Engine", icon: Crown, angle: 205.6, distance: 260, color: "text-yellow-400" },
  { id: "game", label: "Game Zone", icon: Gamepad2, angle: 257, distance: 210, color: "text-pink-400" },
  { id: "analytics", label: "Analytics", icon: LineChart, angle: 308.4, distance: 240, color: "text-emerald-400" },
];

export function EcosystemVisual() {
  const { isLowEndMode } = usePerformance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center">
      {/* Central Glow */}
      <motion.div
        variants={!isLowEndMode ? glowPulseVariant : {}}
        animate="animate"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none"
      />

      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--text-secondary)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g className="origin-center" style={{ transformOrigin: 'center center' }}>
          {nodes.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const x = Math.cos(rad) * node.distance;
            const y = Math.sin(rad) * node.distance;

            return (
              <motion.line
                key={`line-${node.id}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${x}px)`}
                y2={`calc(50% + ${y}px)`}
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 0.5,
                  strokeDashoffset: [0, -20]
                }}
                transition={{
                  pathLength: { duration: 1.5, delay: 2 + (i * 0.1), ease: "easeOut" },
                  opacity: { duration: 1, delay: 2 + (i * 0.1) },
                  strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Central Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 1.8, duration: 1 }}
        className="absolute z-20 flex flex-col items-center justify-center"
      >
        <GlassPanel premium interactive={false} className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-accent/30 shadow-[0_0_30px_rgba(182,122,61,0.3)]">
          <Database className="w-8 h-8 text-accent mb-1" />
        </GlassPanel>
        <div className="mt-4 px-4 py-1.5 glass-panel rounded-full border-accent/20">
          <span className="text-sm font-medium font-mono text-accent uppercase tracking-widest">OrbitDine Core</span>
        </div>
      </motion.div>

      {/* Orbiting Nodes */}
      {nodes.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const x = Math.cos(rad) * node.distance;
        const y = Math.sin(rad) * node.distance;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: 1,
              x,
              y,
              scale: 1
            }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 100,
              delay: 2.2 + (i * 0.1)
            }}
            className="absolute z-10 flex flex-col items-center"
          >
            <motion.div
              variants={!isLowEndMode ? floatingVariant : {}}
              animate="animate"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <GlassPanel className="w-14 h-14 rounded-2xl flex items-center justify-center hover:border-text-primary/30 transition-colors cursor-pointer group">
                <node.icon className={`w-6 h-6 ${node.color} group-hover:scale-110 transition-transform`} />
              </GlassPanel>

              {/* Tooltip-style label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-3 py-1.5 bg-surface border border-border rounded-lg shadow-xl">
                  <span className="text-xs font-medium text-text-primary">{node.label}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
