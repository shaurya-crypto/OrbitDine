import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";
import { Store, MoreVertical } from "lucide-react";
import { RestaurantActions } from "./RestaurantActions";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  await connectToDatabase();
  
  // In a real production system with thousands of restaurants, we'd paginate via URL searchParams.
  // For this demonstration, we'll fetch the latest 50.
  const restaurants = await Restaurant.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("ownerId", "fullName email")
    .lean();

  return (
    <div className="p-8 pb-20 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight mb-2">Restaurants</h1>
          <p className="text-zinc-400">Manage all registered businesses.</p>
        </div>
      </div>

      <GlassPanel className="border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500 font-medium bg-zinc-950/50">
                <th className="p-4 pl-6">Restaurant</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Location</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {restaurants.map((res: any) => (
                <tr key={res._id.toString()} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {res.logo ? (
                          <img src={res.logo} alt={res.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/restaurants/${res._id}`} className="font-medium text-white hover:text-red-400 transition-colors">
                          {res.name}
                        </Link>
                        <p className="text-xs text-zinc-500">{res.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-zinc-300">
                    <p>{res.ownerId?.fullName || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">{res.ownerId?.email || "No email"}</p>
                  </td>
                  <td className="p-4 text-sm text-zinc-300">
                    {res.city ? `${res.city}, ${res.country}` : "Unspecified"}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {res.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                      res.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      res.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <RestaurantActions 
                      id={res._id.toString()} 
                      currentStatus={res.status}
                      name={res.name}
                    />
                  </td>
                </tr>
              ))}
              
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No restaurants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
