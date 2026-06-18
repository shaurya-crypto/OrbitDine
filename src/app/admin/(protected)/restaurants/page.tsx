import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import "@/models/User";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RestaurantTable } from "./RestaurantTable";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  await connectToDatabase();
  
  // In a real production system with thousands of restaurants, we'd paginate via URL searchParams.
  const restaurants = await Restaurant.find()
    .sort({ createdAt: -1 })
    .limit(10)
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

      <RestaurantTable initialData={JSON.parse(JSON.stringify(restaurants))} />
    </div>
  );
}
