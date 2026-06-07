"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isLoading?: boolean;
}

export function QuantitySelector({ quantity, onIncrease, onDecrease, isLoading }: QuantitySelectorProps) {
  return (
    <div className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          onDecrease();
        }}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-zinc-700 shadow-sm text-zinc-600 dark:text-zinc-300 active:scale-95 disabled:opacity-50 transition-all"
      >
        <Minus size={16} />
      </button>
      <span className="w-4 text-center font-medium text-sm text-zinc-900 dark:text-white">{quantity}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onIncrease();
        }}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white active:scale-95 disabled:opacity-50 transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
