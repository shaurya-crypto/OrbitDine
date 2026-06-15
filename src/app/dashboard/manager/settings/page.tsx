"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Save, Building2, MapPin, Phone, Mail, Clock, Utensils, Globe, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { useToast } from "@/components/ui/ToastProvider";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker"), { ssr: false, loading: () => <div className="w-full h-64 bg-zinc-100 rounded-xl animate-pulse"></div> });

export default function SettingsPage() {
  const { restaurantId, roles } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, verifyText: "", isDeleting: false });
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    restaurantType: "",
    cuisineType: "",
    openingHours: "",
    closingHours: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    logo: ""
  });

  useEffect(() => {
    if (restaurantId) {
      fetch(`/api/restaurant/settings?restaurantId=${restaurantId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setFormData({
              name: data.name || "",
              address: data.address || "",
              contactEmail: data.email || "", 
              contactPhone: data.phone || "",
              city: data.city || "",
              state: data.state || "",
              country: data.country || "",
              pinCode: data.pinCode || "",
              restaurantType: data.restaurantType || "",
              cuisineType: data.cuisineType || "",
              openingHours: data.openingHours || "",
              closingHours: data.closingHours || "",
              latitude: data.latitude,
              longitude: data.longitude,
              logo: data.logo || ""
            });
          }
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed to load settings");
        });
    }
  }, [restaurantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, ...formData })
      });
      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update settings");
    }
    setSaving(false);
  };

  const handleDeleteRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteModal.verifyText !== "DELETE") return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      const res = await fetch(`/api/restaurant/settings?restaurantId=${restaurantId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Restaurant successfully deleted.");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete restaurant");
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete restaurant");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Restaurant Settings</h1>
          <p className="text-zinc-400">Manage all operational information and public profiles.</p>
        </div>
      </div>

      {/* Logo & Identity */}
      <GlassPanel className="p-8">
        <h2 className="text-xl font-serif text-white mb-6 border-b border-zinc-800 pb-2">Identity & Operations</h2>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center relative group">
               {formData.logo ? (
                 <Image src={formData.logo} alt="Logo" fill className="object-cover" />
               ) : (
                 <Building2 size={32} className="text-zinc-700" />
               )}
               <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Upload size={24} className="text-white" />
                 <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
               </label>
             </div>
             <p className="text-xs text-zinc-500 text-center">Click image to upload<br/>(Max 2MB)</p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                <Building2 size={16} className="text-accent" /> Restaurant Name
              </label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                <Utensils size={16} className="text-accent" /> Restaurant Type
              </label>
              <input name="restaurantType" value={formData.restaurantType} onChange={handleChange} placeholder="e.g. Fine Dining" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                <Utensils size={16} className="text-accent" /> Cuisine Type
              </label>
              <input name="cuisineType" value={formData.cuisineType} onChange={handleChange} placeholder="e.g. Italian" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-zinc-800">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Clock size={16} className="text-accent" /> Opening Hours
            </label>
            <input name="openingHours" type="time" value={formData.openingHours} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent [color-scheme:dark]" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Clock size={16} className="text-accent" /> Closing Hours
            </label>
            <input name="closingHours" type="time" value={formData.closingHours} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent [color-scheme:dark]" />
          </div>
        </div>
      </GlassPanel>

      {/* Contact Details */}
      <GlassPanel className="p-8">
        <h2 className="text-xl font-serif text-white mb-6 border-b border-zinc-800 pb-2">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Mail size={16} className="text-accent" /> Public Email
            </label>
            <input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="contact@restaurant.com" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Phone size={16} className="text-accent" /> Contact Phone
            </label>
            <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+1 234 567 8900" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>
        </div>
      </GlassPanel>

      {/* Location Details */}
      <GlassPanel className="p-8">
        <h2 className="text-xl font-serif text-white mb-6 border-b border-zinc-800 pb-2">Location & Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Globe size={16} className="text-accent" /> Country
            </label>
            <input name="country" value={formData.country} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <MapPin size={16} className="text-accent" /> State / Region
            </label>
            <input name="state" value={formData.state} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <MapPin size={16} className="text-accent" /> City
            </label>
            <input name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <MapPin size={16} className="text-accent" /> Pin / Zip Code
            </label>
            <input name="pinCode" value={formData.pinCode} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
            <MapPin size={16} className="text-accent" /> Full Street Address
          </label>
          <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between text-zinc-300">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-accent" /> Precise Map Location</span>
            <span className="text-xs text-zinc-500">Drag pin to update</span>
          </label>
          <MapPicker 
            initialPosition={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
            onPositionChange={(pos) => setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))}
            onLocationDetailsFetched={(details) => setFormData(prev => ({
              ...prev,
              city: details.city || prev.city,
              state: details.state || prev.state,
              country: details.country || prev.country,
              pinCode: details.pinCode || prev.pinCode,
              address: details.address || prev.address
            }))}
          />
        </div>
      </GlassPanel>

      <div className="flex justify-end pt-4 mb-12">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-accent text-white rounded-xl font-bold tracking-wide hover:bg-accent/90 transition-all shadow-lg flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      {/* Danger Zone (Owner Only) */}
      {roles.includes("owner") && (
        <GlassPanel className="p-8 border-red-500/30 bg-red-500/5">
          <h2 className="text-xl font-serif text-red-500 mb-2">Danger Zone</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Deleting your restaurant is irreversible. It will remove all your menus, tables, orders, and staff associations. Your account will revert to a customer account.
          </p>
          <button
            onClick={() => setDeleteModal({ isOpen: true, verifyText: "", isDeleting: false })}
            className="px-6 py-3 border border-red-500 text-red-500 font-medium rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Delete Restaurant
          </button>
        </GlassPanel>
      )}

      {/* Delete Restaurant Verification Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/30 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <h2 className="text-2xl font-serif">Delete Restaurant</h2>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                This action is <strong>irreversible</strong>. It will completely erase all menus, tables, orders, and staff associations immediately.
              </p>
              
              <form onSubmit={handleDeleteRestaurant}>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-white mb-1.5">Type <strong>DELETE</strong> to confirm</label>
                  <input 
                    required 
                    autoFocus
                    type="text" 
                    value={deleteModal.verifyText} 
                    onChange={e => setDeleteModal({...deleteModal, verifyText: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:outline-none" 
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                  <button type="button" onClick={() => setDeleteModal({ isOpen: false, verifyText: "", isDeleting: false })} className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors">
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
    </div>
  );
}
