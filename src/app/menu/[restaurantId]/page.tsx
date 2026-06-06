"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { MenuHeader } from "@/components/customer/MenuHeader";
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
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    // Owners and Managers can preview the menu without a session
    const { roles } = useAuthStore.getState();
    const isBusinessAdmin = roles.includes("owner") || roles.includes("manager");
    
    // If no active session and not an admin, they can still view the menu but won't be able to order.
    // We remove the strict boot-out to allow public browsing.
  }, [sessionId, sessionRestaurantId, restaurantId, router]);

  useEffect(() => {
    if (!sessionId) return;

    // Dynamically import getPusherClient to avoid SSR issues if any
    import("@/lib/pusher/client").then(({ getPusherClient }) => {
      const pusherClient = getPusherClient();
      if (!pusherClient) return;

      const channelName = `private-session-${sessionId}`;
      const channel = pusherClient.subscribe(channelName);
      
      channel.bind("session_completed", (data: any) => {
        // When session is closed, redirect to the rating page
        useSessionStore.getState().clearSession();
        router.push(`/restaurant/${restaurantId}/rate`);
      });

      return () => {
        channel.unbind("session_completed");
        pusherClient.unsubscribe(channelName);
      };
    });
  }, [sessionId, restaurantId, router]);

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
        tableNumber={tableNumber || "N/A"}
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
