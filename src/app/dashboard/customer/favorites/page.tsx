"use client";

import { useEffect, useState } from "react";
import { Heart, Store, Utensils, Star, ArrowRight } from "lucide-react";
import { RestaurantCard } from "@/components/discovery/RestaurantCard";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

export default function FavoritesPage() {
  const [data, setData] = useState({ savedRestaurants: [], followingRestaurants: [], favoriteItems: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"restaurants" | "items">("restaurants");
  const toast = useToast();

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const token = localStorage.getItem("auth-token") || "";
        const res = await fetch("/api/customer/interactions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (e) {
        toast.error("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading your favorites...</div>;

  const restaurants = [...data.savedRestaurants, ...data.followingRestaurants].filter(
    (v: any, i, a: any[]) => a.findIndex((t: any) => t._id === v._id) === i
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 text-text-primary">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-1">Your Favorites</h1>
        <p className="text-zinc-400">Restaurants you follow and dishes you love.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab("restaurants")} 
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "restaurants" ? "border-accent text-accent" : "border-transparent text-text-secondary"}`}
        >
          <Store className="w-4 h-4" /> Restaurants ({restaurants.length})
        </button>
        <button 
          onClick={() => setActiveTab("items")} 
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "items" ? "border-accent text-accent" : "border-transparent text-text-secondary"}`}
        >
          <Utensils className="w-4 h-4" /> Dishes ({data.favoriteItems.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "restaurants" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant: any) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-surface/30">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No saved restaurants</h3>
              <p className="text-zinc-400 mb-6">Follow or save your favorite restaurants to see them here.</p>
              <Link href="/explore" className="text-accent hover:underline inline-flex items-center gap-1">
                Explore Restaurants <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.favoriteItems.length > 0 ? (
            data.favoriteItems.map((item: any) => (
              <div key={item._id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-xl flex-shrink-0 overflow-hidden relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}
                  {item.veg !== undefined && (
                     <div className={`absolute top-1 left-1 w-3 h-3 rounded-sm border flex items-center justify-center bg-white ${item.veg ? "border-green-500" : "border-red-500"}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-green-500" : "bg-red-500"}`} />
                     </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white line-clamp-1">{item.name}</h3>
                  <Link href={`/restaurant/${item.restaurantId?.slug}`} className="text-xs text-accent hover:underline line-clamp-1 mb-2">
                    {item.restaurantId?.name}
                  </Link>
                  <div className="font-medium text-white flex items-center justify-between">
                    <span>${item.price.toFixed(2)}</span>
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-surface/30">
              <Utensils className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No favorite dishes</h3>
              <p className="text-zinc-400 mb-6">Like dishes from menus to save them here for quick reordering.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
