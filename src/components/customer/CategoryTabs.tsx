"use client";

import { motion } from "framer-motion";

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar bg-neutral-50/80 backdrop-blur-md sticky top-[104px] z-30 border-b border-neutral-200">
      <div className="flex px-4 py-3 space-x-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-900 bg-white shadow-sm border border-neutral-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-neutral-900 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
