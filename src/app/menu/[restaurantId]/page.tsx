"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { MenuHero } from "@/components/customer/MenuHero";
import { MenuSearch } from "@/components/customer/MenuSearch";
import { FeaturedCarousel } from "@/components/customer/FeaturedCarousel";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { FloatingCartButton } from "@/components/customer/FloatingCartButton";
import { Loader } from "@/components/ui/Loader";

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  
  const { sessionId, restaurantId: sessionRestaurantId, tableNumber } = useSessionStore();
  const { data, isLoading, isError } = useMenu(restaurantId);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    import("@/lib/pusher/client").then(({ getPusherClient }) => {
      const pusherClient = getPusherClient();
      if (!pusherClient) return;
      const channelName = `private-session-${sessionId}`;
      const channel = pusherClient.subscribe(channelName);
      channel.bind("session_completed", (data: any) => {
        useSessionStore.getState().clearSession();
        router.push(`/restaurant/${restaurantId}/rate`);
      });
      return () => {
        channel.unbind("session_completed");
        pusherClient.unsubscribe(channelName);
      };
    });
  }, [sessionId, restaurantId, router]);

  // Extract flat list of all items for search and highlights mapping
  const allItems = useMemo(() => {
    if (!data?.menu) return [];
    return data.menu.flatMap((cat: any) => cat.items);
  }, [data]);

  // Filter items based on search and active category
  const filteredMenu = useMemo(() => {
    if (!data?.menu) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    return data.menu.map((category: any) => {
      const items = category.items.filter((item: any) => {
        const matchesSearch = !query || 
          item.name.toLowerCase().includes(query) || 
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.ingredients && item.ingredients.some((i: string) => i.toLowerCase().includes(query))) ||
          (item.dietaryTags && item.dietaryTags.some((d: string) => d.toLowerCase().includes(query))) ||
          category.name.toLowerCase().includes(query);
          
        return matchesSearch;
      });
      return { ...category, items };
    }).filter((cat: any) => cat.items.length > 0);
  }, [data, searchQuery]);

  // Track page view
  useEffect(() => {
    if (restaurantId) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          sessionId,
          eventType: "item_view",
        })
      }).catch(console.error);
    }
  }, [restaurantId, sessionId]);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader /></div>;
  if (isError || !data) return <div className="p-6 text-center text-red-500">Failed to load menu. Please try again.</div>;

  const restaurant = data.restaurant;
  const highlights = data.highlights;

  const resolveItems = (ids: string[]) => ids.map(id => allItems.find((i: any) => i.id === id)).filter(Boolean);

  const bestsellers = resolveItems(highlights?.bestsellers || []);
  const chefSpecials = resolveItems(highlights?.chefSpecials || []);
  const newArrivals = resolveItems(highlights?.newArrivals || []);
  const ltos = resolveItems(highlights?.limitedTimeOffers || []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24 relative selection:bg-accent/30 text-zinc-900 dark:text-zinc-100">
      <MenuHero 
        restaurant={restaurant} 
        tableNumber={tableNumber || "N/A"}
      />

      <MenuSearch onSearch={setSearchQuery} />

      {!searchQuery && (
        <div className="bg-white dark:bg-zinc-950/50 pt-2">
          <FeaturedCarousel 
            title="Limited Time Offers ⏳" 
            items={ltos} 
            badgeText="LTO" 
            badgeColor="bg-red-500" 
            onAddToCart={() => {}}
          />
          <FeaturedCarousel 
            title="Chef Specials 👨‍🍳" 
            items={chefSpecials} 
            badgeText="Special" 
            badgeColor="bg-purple-500" 
            onAddToCart={() => {}}
          />
          <FeaturedCarousel 
            title="Best Sellers 🏆" 
            items={bestsellers} 
            badgeText="Bestseller" 
            badgeColor="bg-orange-500" 
            onAddToCart={() => {}}
          />
          <FeaturedCarousel 
            title="Today's Popular Items 🔥" 
            items={newArrivals} // Map new arrivals or highly viewed items here
            badgeText="Popular" 
            badgeColor="bg-blue-500" 
            onAddToCart={() => {}}
          />
        </div>
      )}

      {/* Categories sticky header */}
      <div className="sticky top-[60px] z-20 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md pb-2 pt-4 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryTabs 
            categories={[{ id: "all", name: "All Items" }, ...data.menu.map((c: any) => ({ id: c.id, name: c.name }))]}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      <div className="p-4 space-y-8 max-w-7xl mx-auto mt-6">
        {filteredMenu.map((category: any) => {
          if (activeCategory !== "all" && activeCategory !== category.id) return null;
          
          return (
            <div key={category.id} className="scroll-mt-40">
              <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                {category.name}
                <span className="text-sm font-sans font-medium text-text-secondary bg-surface border border-border px-3 py-1 rounded-full shadow-sm">
                  {category.items.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {category.items.map((item: any) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    restaurantId={restaurantId}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {filteredMenu.length === 0 && (
          <div className="text-center py-24 text-zinc-500 font-medium">
            No items found matching your search.
          </div>
        )}
      </div>

      <FloatingCartButton />
    </main>
  );
}
