"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";
import { Search, MapPin, Star, Clock, Utensils, Heart, Filter, ChevronRight, Home, Menu, User, MoreHorizontal, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RequestRoleModal } from "@/components/dashboard/layout/RequestRoleModal";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  cuisineType: string;
  rating: number;
  reviewCount: number;
  averagePrice: number;
  city: string;
  address: string;
}

interface RecentOrder {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  totalAmount: number;
  date: string;
  status: string;
}

export default function CustomerDashboardPage() {
  const { name, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating"); // rating, price_asc, price_desc, new
  const [activeTab, setActiveTab] = useState<"explore" | "saved" | "orders">("explore");
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDashboardData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [sort, search]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/dashboard?search=${search}&sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.exploreRestaurants);
        setRecentOrders(data.recentOrders);
        setSavedRestaurants(data.user.savedRestaurants);
      }
    } catch (e) {
      console.error("Failed to load customer dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const toggleSaveRestaurant = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic UI update
    const isSaved = savedRestaurants.some(r => r._id === restaurantId);
    if (isSaved) {
      setSavedRestaurants(prev => prev.filter(r => r._id !== restaurantId));
    } else {
      const rest = restaurants.find(r => r._id === restaurantId);
      if (rest) setSavedRestaurants(prev => [...prev, rest]);
    }

    try {
      await fetch(`/api/customer/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId })
      });
    } catch (err) {
      console.error(err);
      fetchDashboardData(); // Revert on failure
    }
  };

  const renderPrice = (priceLevel: number) => {
    return Array.from({ length: 4 }).map((_, i) => (
      <span key={i} className={i < priceLevel ? "text-text-primary" : "text-border"}>$</span>
    ));
  };

  if (loading && restaurants.length === 0) {
    return <div className="h-screen flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="pb-24 md:pb-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4 md:pt-0">
        <div>
          <p className="text-text-secondary text-sm md:text-base font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl md:text-5xl font-serif text-text-primary tracking-tight">
            {name?.split(" ")[0]} <span className="text-accent">!</span>
          </h1>
        </div>
        
        {/* Search & Sort (Desktop + Mobile) */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search restaurants, cuisines..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-2xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all shadow-sm"
            />
          </form>
          
          <div className="relative group">
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-surface border border-border rounded-2xl px-6 py-3.5 pr-12 text-text-primary focus:border-accent outline-none cursor-pointer shadow-sm font-medium"
            >
              <option value="rating">Top Rated</option>
              <option value="new">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-text-primary">Near You</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <Link href={`/restaurant/${restaurant._id}`} key={restaurant._id} className="group block">
                <GlassPanel premium className="p-0 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/40 hover:-translate-y-1">
                  {/* Image Header */}
                  <div className="relative h-48 bg-border w-full overflow-hidden">
                    {restaurant.logo ? (
                      <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-neutral-900/40 flex items-center justify-center">
                        <Utensils className="w-12 h-12 text-accent/50" />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => toggleSaveRestaurant(restaurant._id, e)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:bg-white/20"
                    >
                      <Heart className={`w-5 h-5 ${savedRestaurants.some(r => r._id === restaurant._id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
                    
                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}</span>
                      <span className="text-xs text-neutral-500">({restaurant.reviewCount})</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg text-text-primary line-clamp-1">{restaurant.name}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary mb-4">
                      <span className="bg-border/50 px-2 py-0.5 rounded-md text-xs font-medium">{restaurant.cuisineType || "Various"}</span>
                      <span>•</span>
                      <span className="font-medium tracking-widest text-xs">{renderPrice(restaurant.averagePrice)}</span>
                      <span>•</span>
                      <span className="flex items-center truncate"><MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> {restaurant.city}</span>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>

          {restaurants.length === 0 && !loading && (
            <div className="text-center py-20 bg-surface border border-border rounded-3xl">
              <Utensils className="w-16 h-16 text-border mx-auto mb-4" />
              <h3 className="text-xl font-medium text-text-primary mb-2">No restaurants found</h3>
              <p className="text-text-secondary">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-text-primary">Saved Restaurants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedRestaurants.map((restaurant) => (
              <Link href={`/restaurant/${restaurant._id}`} key={restaurant._id} className="group block">
                {/* Same card design as explore */}
                <GlassPanel premium className="p-0 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/40 hover:-translate-y-1">
                  <div className="relative h-48 bg-border w-full overflow-hidden">
                    {restaurant.logo ? (
                      <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-neutral-900/40 flex items-center justify-center">
                        <Utensils className="w-12 h-12 text-accent/50" />
                      </div>
                    )}
                    <button 
                      onClick={(e) => toggleSaveRestaurant(restaurant._id, e)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all hover:bg-white/20"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif text-lg text-text-primary mb-1 line-clamp-1">{restaurant.name}</h3>
                    <p className="text-sm text-text-secondary mb-4">{restaurant.cuisineType || "Various"}</p>
                    <div className="mt-auto flex items-center justify-between text-accent font-medium text-sm">
                      View Details <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            ))}
            
            {savedRestaurants.length === 0 && (
              <div className="col-span-full text-center py-20 bg-surface border border-border rounded-3xl">
                <Heart className="w-16 h-16 text-border mx-auto mb-4" />
                <h3 className="text-xl font-medium text-text-primary mb-2">No saved restaurants</h3>
                <p className="text-text-secondary">Tap the heart icon on any restaurant to save it here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-text-primary">Recent Orders</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentOrders.map((order) => (
              <GlassPanel key={order._id} className="p-5 flex items-center gap-5 hover:border-accent/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-border/50 flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-6 h-6 text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{order.restaurantName}</h3>
                  <div className="flex items-center text-sm text-text-secondary gap-3 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(order.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="capitalize text-accent font-medium">{order.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">${order.totalAmount.toFixed(2)}</p>
                  <Link href={`/restaurant/${order.restaurantId}`} className="text-xs text-text-secondary hover:text-accent mt-1 inline-block">Order Again</Link>
                </div>
              </GlassPanel>
            ))}
            
            {recentOrders.length === 0 && (
              <div className="col-span-full text-center py-20 bg-surface border border-border rounded-3xl">
                <Clock className="w-16 h-16 text-border mx-auto mb-4" />
                <h3 className="text-xl font-medium text-text-primary mb-2">No past orders</h3>
                <p className="text-text-secondary">When you scan a QR code and order, it will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Ultra Responsive & Vibrant) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/80 backdrop-blur-xl border-t border-border px-6 py-4 pb-safe flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "explore" ? "text-accent" : "text-text-secondary hover:text-text-primary"}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === "explore" ? "bg-accent/10" : ""}`}>
            <Home className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium">Explore</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("saved")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "saved" ? "text-accent" : "text-text-secondary hover:text-text-primary"}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === "saved" ? "bg-accent/10" : ""}`}>
            <Heart className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium">Saved</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "orders" ? "text-accent" : "text-text-secondary hover:text-text-primary"}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === "orders" ? "bg-accent/10" : ""}`}>
            <Utensils className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium">Orders</span>
        </button>

        {/* 3-Dot User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex flex-col items-center gap-1 transition-colors ${showUserMenu ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <div className={`p-2 rounded-xl transition-all ${showUserMenu ? "bg-border/50" : ""}`}>
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full right-0 mb-4 w-56 bg-surface border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-5">
              <div className="p-3 border-b border-border mb-2">
                <p className="font-medium text-text-primary">{name}</p>
                <p className="text-xs text-text-secondary">Customer Account</p>
              </div>
              <button onClick={() => {window.location.href='/dashboard/customer/settings'; setShowUserMenu(false);}} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-border/30 text-sm font-medium text-text-primary flex items-center gap-3 transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button onClick={() => logout()} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-500 flex items-center gap-3 transition-colors mt-1">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
