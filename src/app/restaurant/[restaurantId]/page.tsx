"use client";

import { useEffect, useState, use } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { FloatingCartButton } from "@/components/customer/FloatingCartButton";
import dynamic from "next/dynamic";

const MapDisplay = dynamic(() => import("@/components/ui/MapDisplay"), { ssr: false, loading: () => <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-900 border border-border rounded-xl animate-pulse"></div> });
import { ArrowLeft, MapPin, Star, Clock, Utensils, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RestaurantProfile {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  cuisineType: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  closingHours?: string;
  rating: number;
  reviewCount: number;
  averagePrice: number;
  latitude?: number;
  longitude?: number;
}

export default function RestaurantProfilePage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = use(params);
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [resolvedParams.restaurantId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/restaurant/profile/${resolvedParams.restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderPrice = (priceLevel: number) => {
    return Array.from({ length: 4 }).map((_, i) => (
      <span key={i} className={i < priceLevel ? "text-text-primary" : "text-border"}>$</span>
    ));
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-surface"><Loader /></div>;
  
  if (!restaurant) return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface text-center px-4">
      <h1 className="text-2xl font-serif mb-2">Restaurant not found</h1>
      <button onClick={() => router.back()} className="text-accent flex items-center mt-4"><ArrowLeft className="w-4 h-4 mr-2"/> Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      {/* Cover Image & Header */}
      <div className="relative h-64 md:h-80 w-full bg-neutral-900 overflow-hidden">
        {restaurant.logo ? (
          <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover opacity-60" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-neutral-900/40 flex items-center justify-center">
            <Utensils className="w-16 h-16 text-accent/30" />
          </div>
        )}
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={() => router.push('/dashboard/customer')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        {/* Floating Info inside Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent text-white px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                  {restaurant.cuisineType || "Various"}
                </span>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-white text-xs font-bold">{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-tight">
                {restaurant.name}
              </h1>
            </div>
            
            <Link 
              href={`/menu/${restaurant._id}`}
              className="px-6 py-3 bg-accent text-white rounded-xl font-medium shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" /> View Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-text-primary mb-3">About</h2>
            <p className="text-text-secondary leading-relaxed">
              {restaurant.description || "Welcome to our restaurant! We pride ourselves on offering a fantastic dining experience."}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-text-primary mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <GlassPanel className="p-4 flex flex-col gap-1">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Average Cost</span>
                <span className="font-medium tracking-widest text-text-primary">{renderPrice(restaurant.averagePrice)}</span>
              </GlassPanel>
              
              <GlassPanel className="p-4 flex flex-col gap-1">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Reviews</span>
                <span className="font-medium text-text-primary">{restaurant.reviewCount} total</span>
              </GlassPanel>
            </div>
          </section>
        </div>
        
        {/* Right Column: Contact & Hours */}
        <div className="space-y-6">
          <GlassPanel premium className="p-6 border-accent/20">
            <h3 className="font-serif text-lg text-text-primary mb-4">Location & Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-primary text-sm font-medium">{restaurant.address}</p>
                  <p className="text-text-secondary text-sm">{restaurant.city}, {restaurant.state} {restaurant.pinCode}</p>
                  <a 
                    href={
                      restaurant.latitude && restaurant.longitude 
                        ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}` 
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address} ${restaurant.city}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-accent text-xs font-medium hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
              
              {restaurant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-text-primary text-sm">{restaurant.phone}</p>
                </div>
              )}
              
              {restaurant.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-text-primary text-sm font-medium">{restaurant.email}</p>
                </div>
              )}
            </div>

            {restaurant.latitude && restaurant.longitude && (
              <div className="mt-6">
                <MapDisplay position={{ lat: restaurant.latitude, lng: restaurant.longitude }} />
              </div>
            )}
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="font-serif text-lg text-text-primary mb-4">Opening Hours</h3>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-text-secondary shrink-0" />
              <div>
                <p className="text-text-primary text-sm font-medium">Everyday</p>
                <p className="text-text-secondary text-sm">
                  {restaurant.openingHours || "10:00 AM"} - {restaurant.closingHours || "10:00 PM"}
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
}
