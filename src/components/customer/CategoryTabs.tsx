"use client";

import { motion } from "framer-motion";

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex px-4 py-1 space-x-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full -z-10"
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
