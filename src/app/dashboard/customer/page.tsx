"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { 
  Search, MapPin, Star, Clock, Utensils, Heart, ChevronRight, 
  Home, User, MoreHorizontal, Settings, LogOut, Receipt, Award, 
  TrendingUp, MessageSquare, Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useToast } from "@/components/ui/ToastProvider";
import { FloatingInput } from "@/components/ui/FloatingInput";

export default function CustomerDashboardPage() {
  const { name, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "favorites" | "reviews" | "settings">("overview");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, verifyText: "", isDeleting: false });
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/dashboard-data`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json.data);
      }
    } catch (e) {
      console.error("Failed to load customer dashboard", e);
      toast.error("Failed to load customer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6 bg-base">
        <div className="h-32 bg-surface border border-border rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface border border-border rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="h-64 bg-surface border border-border rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  const { profile, recentOrders, savedRestaurants, favoriteItems, recentReviews } = dashboardData;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteModal.verifyText !== "DELETE") return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      const res = await fetch("/api/customer/settings", { method: "DELETE" });
      if (res.ok) {
        logout();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account.");
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete account.");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="pb-24 md:pb-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative min-h-screen p-4 md:p-8 bg-base">
      
      {/* Header Section - Sticky and Mobile Optimized */}
      <div className="sticky top-0 z-[60] bg-base/80 backdrop-blur-xl border-b border-border/50 -mx-4 px-4 py-4 mb-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-text-secondary font-medium mb-0.5 tracking-wide uppercase text-xs md:text-sm">Welcome back,</p>
          <h1 className="text-2xl md:text-4xl font-serif text-text-primary tracking-tight">
            {profile.fullName.split(" ")[0]} <span className="text-accent">!</span>
          </h1>
        </div>
        <div className="flex-shrink-0 z-[60] flex items-center gap-2 md:gap-3">
          <Link href="/explore" className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-text-primary text-base text-xs md:text-sm font-medium rounded-full hover:scale-105 transition-transform">
            <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-4 border-b border-border pb-4">
        {[
          { id: "overview", label: "Overview", icon: Home },
          { id: "history", label: "Order History", icon: Receipt },
          { id: "favorites", label: "Favorites", icon: Heart },
          { id: "reviews", label: "My Ratings", icon: Star },
          { id: "settings", label: "Settings", icon: Settings }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? "bg-text-primary text-base" 
                : "bg-surface text-text-secondary border border-border hover:border-text-primary/30"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Profile Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel premium className="p-5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-2"><Receipt size={20} /></div>
              <p className="text-sm text-text-secondary font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-text-primary">{profile.totalOrders}</h3>
            </GlassPanel>
            
            <GlassPanel premium className="p-5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-2"><TrendingUp size={20} /></div>
              <p className="text-sm text-text-secondary font-medium">Total Spent</p>
              <h3 className="text-2xl font-bold text-text-primary">₹{profile.totalSpent.toFixed(2)}</h3>
            </GlassPanel>

            <GlassPanel premium className="p-5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-2"><MapPin size={20} /></div>
              <p className="text-sm text-text-secondary font-medium">Places Visited</p>
              <h3 className="text-2xl font-bold text-text-primary">{profile.restaurantsVisited}</h3>
            </GlassPanel>

            <GlassPanel premium className="p-5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-2"><Award size={20} /></div>
              <p className="text-sm text-text-secondary font-medium">Loyalty Progress</p>
              <h3 className="text-2xl font-bold text-text-primary">Level 1</h3>
            </GlassPanel>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Orders Snippet */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-serif text-text-primary">Recent Orders</h2>
                <button onClick={() => setActiveTab("history")} className="text-sm text-accent hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {recentOrders.slice(0, 3).map((order: any) => (
                  <GlassPanel key={order.sessionId} className="p-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden">
                      {order.restaurant?.image ? (
                        <img src={order.restaurant.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Utensils className="text-text-secondary" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary truncate">{order.restaurant?.name || "Unknown Restaurant"}</h4>
                      <p className="text-xs text-text-secondary mt-1">{new Date(order.date).toLocaleDateString()} • {order.itemsCount} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary">₹{order.total.toFixed(2)}</p>
                      <Link href={`/menu/${order.restaurant?.id}`} className="text-xs text-accent mt-1 inline-block font-medium">Reorder</Link>
                    </div>
                  </GlassPanel>
                ))}
                {recentOrders.length === 0 && (
                  <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                    <p className="text-text-secondary">No orders yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty / Achievements Snippet */}
            <div>
              <h2 className="text-xl font-serif text-text-primary mb-4">Achievements</h2>
              <GlassPanel premium className="p-6 text-center border-dashed border-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0"></div>
                <div className="relative z-10">
                  <Award size={48} className="mx-auto text-accent mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <h3 className="font-semibold text-text-primary mb-2">Foodie Starter</h3>
                  <p className="text-sm text-text-secondary max-w-xs mx-auto">Complete 5 more orders to unlock your next tier and earn exclusive rewards.</p>
                  <div className="w-full bg-surface border border-border h-2 rounded-full mt-6 overflow-hidden">
                    <div className="bg-accent h-full w-1/4 rounded-full"></div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-text-primary">Full Order History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentOrders.map((order: any) => (
              <GlassPanel key={order.sessionId} className="p-5 flex flex-col md:flex-row gap-5 hover:border-accent/30 transition-colors">
                <div className="w-full md:w-24 h-32 md:h-24 rounded-2xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {order.restaurant?.image ? (
                    <img src={order.restaurant.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Utensils className="text-text-secondary" size={32} />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-text-primary">{order.restaurant?.name || "Restaurant"}</h3>
                      <p className="font-bold text-text-primary">₹{order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(order.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize text-accent font-medium">{order.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border border-dashed flex justify-between items-center">
                    <p className="text-sm text-text-secondary font-medium">{order.itemsCount} items ordered</p>
                    {order.restaurant?.id && (
                      <Link href={`/menu/${order.restaurant.id}`} className="text-sm bg-text-primary text-base px-4 py-2 rounded-full font-medium active:scale-95 transition-transform">
                        Order Again
                      </Link>
                    )}
                  </div>
                </div>
              </GlassPanel>
            ))}
            {recentOrders.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Receipt className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-text-primary">No history yet</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-serif text-text-primary mb-6">Saved Restaurants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedRestaurants.map((restaurant: any) => (
                <Link href={`/menu/${restaurant._id}`} key={restaurant._id} className="group block">
                  <GlassPanel premium className="p-0 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/40 hover:-translate-y-1">
                    <div className="relative h-40 w-full overflow-hidden bg-surface">
                      {restaurant.bannerImage ? (
                        <Image src={restaurant.bannerImage} alt={restaurant.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Utensils className="text-text-secondary" /></div>
                      )}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Heart size={16} className="fill-red-500 text-red-500" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-text-primary text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-text-secondary">{restaurant.cuisineType}</p>
                    </div>
                  </GlassPanel>
                </Link>
              ))}
              {savedRestaurants.length === 0 && (
                <div className="col-span-full p-10 text-center border border-dashed border-border rounded-3xl">
                  <p className="text-text-secondary">You haven't saved any restaurants yet.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-text-primary mb-6">Favorite Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((item: any) => (
                <GlassPanel key={item._id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface border border-border overflow-hidden flex items-center justify-center">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <Utensils className="text-text-secondary opacity-50" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{item.name}</h4>
                    <p className="font-medium text-text-primary">₹{item.price}</p>
                  </div>
                </GlassPanel>
              ))}
              {favoriteItems.length === 0 && (
                <div className="col-span-full p-10 text-center border border-dashed border-border rounded-3xl">
                  <p className="text-text-secondary">Order items to add them to your favorites.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-text-primary">Feedback History</h2>
          <div className="grid gap-4 max-w-3xl">
            {recentReviews.map((review: any) => (
              <GlassPanel key={review._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{review.restaurantId?.name || "Restaurant"}</h3>
                    <p className="text-sm text-text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 bg-accent-soft px-3 py-1 rounded-full border border-accent/20">
                    <Star size={16} className="fill-accent text-accent" />
                    <span className="font-bold text-accent text-sm">{review.rating}.0</span>
                  </div>
                </div>
                {review.feedback && (
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-text-primary italic">"{review.feedback}"</p>
                  </div>
                )}
              </GlassPanel>
            ))}
            {recentReviews.length === 0 && (
              <div className="p-16 text-center border border-dashed border-border rounded-3xl">
                <MessageSquare className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary">You haven't submitted any ratings yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-text-primary mb-6">Account Settings</h2>
          
          <div className="max-w-2xl space-y-6">
            <GlassPanel className="p-6 space-y-6">
              <h3 className="font-semibold text-text-primary text-lg border-b border-border pb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <FloatingInput 
                    type="text" 
                    defaultValue={profile.fullName} 
                    id="settings-name"
                    label="Full Name"
                  />
                </div>
                <div>
                  <FloatingInput 
                    type="email" 
                    defaultValue={profile.email} 
                    id="settings-email"
                    label="Email Address"
                    disabled
                    className="opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-text-secondary mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <FloatingInput 
                    type="tel" 
                    defaultValue={profile.phoneNumber} 
                    id="settings-phone"
                    label="Phone Number"
                  />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-6">
              <h3 className="font-semibold text-text-primary text-lg border-b border-border pb-4">Location Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Enable Location Tracking</h4>
                    <p className="text-sm text-text-secondary">Allow OrbitDine to use your location for better restaurant discovery.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="settings-location-enabled" defaultChecked={profile.locationEnabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white border border-border"></div>
                  </label>
                </div>
                <div>
                  <FloatingInput 
                    type="text" 
                    defaultValue={profile.defaultCity} 
                    id="settings-city"
                    label="Default City / Area"
                  />
                </div>
              </div>
            </GlassPanel>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <button 
                onClick={async () => {
                  try {
                    const fullName = (document.getElementById("settings-name") as HTMLInputElement).value;
                    const phoneNumber = (document.getElementById("settings-phone") as HTMLInputElement).value;
                    const defaultCity = (document.getElementById("settings-city") as HTMLInputElement).value;
                    const locationEnabled = (document.getElementById("settings-location-enabled") as HTMLInputElement).checked;

                    const res = await fetch("/api/customer/settings", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ fullName, phoneNumber, defaultCity, locationEnabled })
                    });
                    if (res.ok) {
                      toast.success("Settings updated successfully!");
                      fetchDashboardData();
                    } else {
                      toast.error("Failed to update settings.");
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error("An error occurred while saving changes.");
                  }
                }}
                className="px-6 py-2 bg-text-primary text-base font-medium rounded-full hover:scale-105 transition-transform"
              >
                Save Changes
              </button>
            </div>

            <GlassPanel className="p-6 mt-8 border border-red-500/20 bg-red-500/5">
              <h3 className="font-semibold text-red-500 text-lg mb-2">Danger Zone</h3>
              <p className="text-sm text-text-secondary mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={() => setDeleteModal({ isOpen: true, verifyText: "", isDeleting: false })}
                className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Delete Account
              </button>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* Delete Account Verification Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/30 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <h2 className="text-2xl font-serif">Delete Account</h2>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                This action is <strong>irreversible</strong>. Your personal data will be completely removed from OrbitDine.
              </p>
              
              <form onSubmit={handleDeleteAccount}>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Type <strong>DELETE</strong> to confirm</label>
                  <input 
                    required 
                    autoFocus
                    type="text" 
                    value={deleteModal.verifyText} 
                    onChange={e => setDeleteModal({...deleteModal, verifyText: e.target.value})} 
                    className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-red-500 focus:outline-none" 
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button type="button" onClick={() => setDeleteModal({ isOpen: false, verifyText: "", isDeleting: false })} className="px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={deleteModal.isDeleting || deleteModal.verifyText !== "DELETE"} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    {deleteModal.isDeleting ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-safe flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: "overview", icon: Home, label: "Home" },
          { id: "history", icon: Receipt, label: "Orders" },
          { id: "favorites", icon: Heart, label: "Saved" },
          { id: "reviews", icon: Star, label: "Reviews" },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? "text-accent" : "text-text-secondary hover:text-text-primary"}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? "bg-accent-soft" : ""}`}>
              <tab.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex flex-col items-center gap-1 transition-colors ${showUserMenu ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <div className={`p-2 rounded-xl transition-all ${showUserMenu ? "bg-surface border border-border" : ""}`}>
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full right-0 mb-4 w-56 bg-surface border border-border rounded-2xl shadow-2xl p-2">
              <div className="p-3 border-b border-border mb-2">
                <p className="font-medium text-text-primary">{profile.fullName}</p>
                <p className="text-xs text-text-secondary">Customer Account</p>
              </div>
              <Link href="/explore" className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-base text-sm font-medium text-text-primary flex items-center gap-3 transition-colors mb-1">
                <Search className="w-4 h-4" /> Find Restaurants
              </Link>
              <button onClick={() => setActiveTab("settings")} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-base text-sm font-medium text-text-primary flex items-center gap-3 transition-colors mb-1">
                <Settings className="w-4 h-4" /> Account Settings
              </button>
              <button onClick={() => logout()} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-500 flex items-center gap-3 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
