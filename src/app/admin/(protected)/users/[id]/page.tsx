import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Users, Mail, Phone, Calendar, ArrowLeft, ShoppingBag, IndianRupee, Heart, MapPin, Award, Store } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const user = await User.findById(id).lean();

  if (!user) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 pb-20 space-y-6 max-w-5xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-500" />
          {user.fullName || "Unnamed User"}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {user.roles?.map((r: string) => (
            <span key={r} className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
              r === "superadmin" ? "bg-red-500/10 text-red-500" :
              r === "owner" ? "bg-blue-500/10 text-blue-500" :
              r === "customer" ? "bg-purple-500/10 text-purple-500" :
              "bg-zinc-800 text-zinc-300"
            }`}>
              {r}
            </span>
          ))}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            user.isVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          }`}>
            {user.isVerified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Stats */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Platform Engagement</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5"/> Total Orders</p>
              <p className="text-xl font-medium text-white">{user.totalOrders || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5"/> Total Spent</p>
              <p className="text-xl font-medium text-white">₹{user.totalSpent?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> Saved Restrnts</p>
              <p className="text-xl font-medium text-white">{user.savedRestaurants?.length || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5"/> Fav Items</p>
              <p className="text-xl font-medium text-white">{user.favoriteItems?.length || 0}</p>
            </div>
          </div>
        </GlassPanel>

        {/* Contact Profile */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Contact Profile</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>{user.email || "N/A"}</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>{user.phoneNumber || "N/A"}</span>
            </div>
            {user.defaultCity && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-500 shrink-0" />
                <span>{user.defaultCity}</span>
              </div>
            )}
            {user.achievements && user.achievements.length > 0 && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="capitalize">{user.achievements.join(', ')}</span>
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Account Meta */}
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50 md:col-span-2">
          <h2 className="text-lg font-medium text-white mb-4">Account Meta</h2>
          <div className="space-y-4 text-sm text-zinc-300 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">User ID</span>
              <span className="font-mono text-xs">{user._id.toString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Joined Date</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Last Login</span>
              <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Location Services</span>
              <span>{user.locationEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            {user.restaurantId && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Employed By (Rest. ID)</span>
                <span className="font-mono text-xs">{user.restaurantId.toString()}</span>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
