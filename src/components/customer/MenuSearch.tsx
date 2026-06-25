import { Search, X, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface MenuSearchProps {
  onSearch: (query: string) => void;
}

export function MenuSearch({ onSearch }: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isAiMode) return; // In AI mode, we search on submit, not on type
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch, isAiMode]);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Simulate AI Semantic Search delay
    setTimeout(() => {
      onSearch(query); // In a real app, this would hit the EmbeddingService API and return vector results
      setIsSearching(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isAiMode) {
      handleAiSearch();
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 px-4 py-3">
      <div className="relative max-w-7xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          className={`block w-full pl-10 pr-24 py-3 border-transparent bg-white dark:bg-zinc-900 rounded-2xl text-sm placeholder-zinc-500 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ${isAiMode ? 'ring-purple-500/50 focus:ring-purple-500' : 'ring-zinc-200 dark:ring-zinc-800 focus:ring-accent'} focus:ring-2 focus:ring-inset outline-none transition-all`}
          placeholder={isAiMode ? "Ask AI (e.g. 'high protein spicy meals')" : "Search items, categories, or keywords..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {query && !isAiMode && (
            <button 
              onClick={() => setQuery("")}
              className="p-2 flex items-center"
            >
              <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" />
            </button>
          )}

          <button
            onClick={() => {
              if (isAiMode && query) handleAiSearch();
              else {
                setIsAiMode(!isAiMode);
                if (isAiMode) onSearch(query); // Revert to standard search if toggled off
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAiMode 
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' 
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
