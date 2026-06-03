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
    <div className="flex items-center space-x-3 bg-neutral-100 rounded-full px-2 py-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          onDecrease();
        }}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-neutral-600 active:scale-95 disabled:opacity-50 transition-all"
      >
        <Minus size={16} />
      </button>
      <span className="w-4 text-center font-medium text-sm">{quantity}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onIncrease();
        }}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-neutral-900 active:scale-95 disabled:opacity-50 transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
