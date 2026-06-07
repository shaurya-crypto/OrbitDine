"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Search, MapPin, Loader2, Navigation, Compass } from "lucide-react";
import { RestaurantCard } from "@/components/discovery/RestaurantCard";
import axios from "axios";

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cityFallback, setCityFallback] = useState("");
  const [radius, setRadius] = useState<number>(25); // Default 25km

  // Request Geolocation
  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError("");
        },
        (err) => {
          console.error("Location error", err);
          let errorMsg = "Location access denied. Please search by city.";
          if (err.code === 1) errorMsg = "You denied location access. Please search by city or enable it in browser settings.";
          if (err.code === 2) errorMsg = "Location unavailable. Please search by city.";
          if (err.code === 3) errorMsg = "Location request timed out. Please search by city.";
          setError(errorMsg);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  const useMockLocation = () => {
    setLocation({ lat: 28.6186, lng: 77.3275 }); // Mayur Vihar Phase 3
    setError("");
  };

  useEffect(() => {
    // Attempt to get location on mount
    requestLocation();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        let url = `/api/discovery/nearby?radius=${radius}`;
        if (location) {
          url += `&lat=${location.lat}&lng=${location.lng}`;
        }
        if (debouncedQuery) {
          url += `&query=${encodeURIComponent(debouncedQuery)}`;
        }
        if (cityFallback) {
          url += `&city=${encodeURIComponent(cityFallback)}`;
        }

        const res = await axios.get(url);
        setRestaurants(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have location OR city fallback OR just want everything (if neither, wait a bit or fetch all)
    // Actually we can fetch all if no location/city by just not passing lat/lng, API will match active.
    fetchRestaurants();
  }, [location, debouncedQuery, cityFallback, radius]);

  // Track page view
  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "discovery_search",
        metadata: { hasLocation: !!location, query: debouncedQuery }
      })
    }).catch(console.error);
  }, [debouncedQuery, location]);

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-16">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Discover Amazing Food</h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Find the best restaurants near you. Browse menus, read reviews, and order seamlessly.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search restaurants, cuisines, or dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-base border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:border-accent text-text-primary"
            />
          </div>

          {!location && (
            <div className="relative w-full md:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input 
                type="text" 
                placeholder="Enter city..." 
                value={cityFallback}
                onChange={(e) => setCityFallback(e.target.value)}
                className="w-full bg-base border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:border-accent text-text-primary"
              />
            </div>
          )}

          <div className="w-full md:w-auto flex items-center gap-3">
            <select 
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-base border border-border text-text-primary px-4 py-3 rounded-xl outline-none focus:border-accent"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>

            <button 
              onClick={requestLocation}
              title="Use current location"
              className={`p-3 rounded-xl border ${location ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary bg-surface'} hover:bg-base transition-colors`}
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
            <button 
              onClick={useMockLocation}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Use Test Location (Mayur Vihar)
            </button>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p>Searching for nearby restaurants...</p>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Search className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-medium text-text-primary mb-2">No restaurants found</h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              We couldn't find any restaurants matching your criteria. Try increasing the radius or searching a different term.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
