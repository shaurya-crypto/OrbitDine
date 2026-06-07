import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface MenuSearchProps {
  onSearch: (query: string) => void;
}

export function MenuSearch({ onSearch }: MenuSearchProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 px-4 py-3">
      <div className="relative max-w-7xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2.5 border-transparent bg-white dark:bg-zinc-900 rounded-xl text-sm placeholder-zinc-500 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-accent outline-none transition-all"
          placeholder="Search items, categories, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
