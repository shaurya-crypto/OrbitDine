import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Store, MapPin, Phone, Mail, Calendar, ArrowLeft, Users, Utensils, Star, ExternalLink, Map } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminRestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const restaurant = await Restaurant.findById(id).lean();

  if (!restaurant) {
    notFound();
  }

  const mapLink = restaurant.latitude && restaurant.longitude 
    ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address} ${restaurant.city} ${restaurant.country}`)}`;

  return (
    <div className="p-4 md:p-8 pb-20 space-y-6 max-w-5xl mx-auto">
      <Link href="/admin/restaurants" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Restaurants
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2 flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-500" />
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              restaurant.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
              restaurant.status === "suspended" ? "bg-red-500/10 text-red-400" :
              "bg-amber-500/10 text-amber-400"
            }`}>
              {restaurant.status?.toUpperCase() || "PENDING"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 uppercase">
              {restaurant.plan || "FREE TIER"}
            </span>
            {restaurant.cuisineType && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                {restaurant.cuisineType}
              </span>
            )}
          </div>
        </div>

        <a 
          href={mapLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Map className="w-4 h-4" />
          Open in Maps
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operations Overview */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Operations Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Staff Count</p>
              <p className="text-xl font-medium text-white">{restaurant.staffCount || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5"/> Total Tables</p>
              <p className="text-xl font-medium text-white">{restaurant.totalTables || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Star className="w-3.5 h-3.5"/> Rating</p>
              <p className="text-xl font-medium text-white">{restaurant.rating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> Geofence</p>
              <p className="text-xl font-medium text-white">{restaurant.geofenceRadius || 100}m</p>
            </div>
          </div>
        </GlassPanel>

        {/* Contact Info */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Contact & Location</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>{restaurant.email || "N/A"}</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>{restaurant.phone || "N/A"}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>
                {restaurant.address || "No address"}<br />
                {restaurant.city ? `${restaurant.city}, ` : ""}{restaurant.state ? `${restaurant.state} ` : ""}
                {restaurant.pinCode || ""}<br />
                {restaurant.country || ""}
              </span>
            </div>
            {restaurant.latitude && restaurant.longitude && (
               <div className="flex items-start gap-3 pl-8 text-xs text-zinc-500">
                 <span>Lat: {restaurant.latitude.toFixed(6)}, Lng: {restaurant.longitude.toFixed(6)}</span>
               </div>
            )}
          </div>
        </GlassPanel>

        {/* System Settings */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">System Settings</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Currency</span>
              <span className="font-mono text-xs">{restaurant.settings?.currency || "INR"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Tax Percentage</span>
              <span>{restaurant.settings?.taxPercentage || 0}%</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Service Charge</span>
              <span>{restaurant.settings?.serviceChargePercentage || 0}%</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Loyalty Program</span>
              <span>{restaurant.settings?.loyaltyEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Game Zone</span>
              <span>{restaurant.settings?.gameZoneEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Audit Details */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Audit Records</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Restaurant ID</span>
              <span className="font-mono text-xs">{restaurant._id.toString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Owner ID</span>
              <span className="font-mono text-xs">{restaurant.ownerId.toString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">URL Slug</span>
              <span className="font-mono text-xs">{restaurant.slug}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Joined Date</span>
              <span>{new Date(restaurant.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Last Updated</span>
              <span>{new Date(restaurant.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
