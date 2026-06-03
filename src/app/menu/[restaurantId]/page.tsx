"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useSessionStore } from "@/stores/sessionStore";
import { MenuHeader } from "@/components/customer/MenuHeader";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { FloatingCartButton } from "@/components/customer/FloatingCartButton";
import { Loader } from "@/components/ui/Loader";

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  
  const { sessionId, restaurantId: sessionRestaurantId } = useSessionStore();
  
  const { data, isLoading, isError } = useMenu(restaurantId);
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    // If no active session, or trying to access a different restaurant's menu, boot them back.
    if (!sessionId || sessionRestaurantId !== restaurantId) {
      router.push("/"); // Or to a dedicated error/scan page
    }
  }, [sessionId, sessionRestaurantId, restaurantId, router]);

  useEffect(() => {
    if (data?.menu && data.menu.length > 0 && !activeCategory) {
      setActiveCategory(data.menu[0].id);
    }
  }, [data, activeCategory]);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;
  if (isError || !data) return <div className="p-6 text-center text-red-500">Failed to load menu. Please try again.</div>;

  const restaurant = data.restaurant;
  const menuCategories = data.menu;

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 relative">
      <MenuHeader 
        restaurantName={restaurant.name} 
        tableNumber={"12"} // In a real app, this should come from session data or context
      />

      <CategoryTabs 
        categories={menuCategories.map((c: any) => ({ id: c.id, name: c.name }))}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {menuCategories.map((category: any) => (
          <div key={category.id} className={activeCategory === category.id ? "block" : "hidden"}>
            {category.items.map((item: any) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        ))}
      </div>

      <FloatingCartButton />
    </main>
  );
}
