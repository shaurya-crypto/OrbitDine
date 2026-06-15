"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Search, Store, Users, ShoppingBag, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: "restaurant" | "user" | "order";
  title: string;
  subtitle: string;
  url: string;
}

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="p-8 pb-20 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-tight mb-2">Global Search</h1>
        <p className="text-zinc-400">Search across restaurants, owners, customers, and orders.</p>
      </div>

      <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
        <div className="relative">
          <FloatingInput
            id="global-search"
            type="text"
            label="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-white pl-12"
            autoFocus
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 animate-spin" />
          )}
        </div>
      </GlassPanel>

      {query.length >= 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            Results ({results.length})
          </h2>
          
          {results.length === 0 && !isSearching && (
            <div className="text-center py-12 text-zinc-500">
              No results found for "{query}".
            </div>
          )}

          <div className="grid gap-4">
            {results.map((res) => (
              <Link key={res.id} href={res.url}>
                <GlassPanel className="p-4 border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    res.type === "restaurant" ? "bg-blue-500/10 text-blue-500" :
                    res.type === "user" ? "bg-purple-500/10 text-purple-500" :
                    "bg-orange-500/10 text-orange-500"
                  }`}>
                    {res.type === "restaurant" && <Store className="w-5 h-5" />}
                    {res.type === "user" && <Users className="w-5 h-5" />}
                    {res.type === "order" && <ShoppingBag className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{res.title}</h3>
                    <p className="text-sm text-zinc-400">{res.subtitle}</p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
