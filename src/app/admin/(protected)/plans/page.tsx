import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CreditCard, TrendingUp, Users, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  await connectToDatabase();
  
  // Aggregate plan distribution
  const planStats = await Restaurant.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$plan", "free"] },
        count: { $sum: 1 },
      }
    }
  ]);

  const statsMap: Record<string, number> = planStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const totalRestaurants = (Object.values(statsMap) as number[]).reduce((a: number, b: number) => a + b, 0);
  const mrrEstimate = (statsMap["pro"] || 0) * 2999 + (statsMap["enterprise"] || 0) * 9999; // Assume dummy INR values

  const PLANS = [
    {
      id: "free",
      name: "Free Tier",
      price: "₹0/mo",
      count: statsMap["free"] || 0,
      color: "text-zinc-400 bg-zinc-500/10 border-zinc-800"
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "₹2,999/mo",
      count: statsMap["pro"] || 0,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "₹9,999/mo",
      count: statsMap["enterprise"] || 0,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="p-4 md:p-8 pb-20 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">Subscription Plans</h1>
        <p className="text-zinc-400 text-sm md:text-base">Overview of platform subscriptions and MRR estimates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Estimated MRR</p>
              <h3 className="text-2xl font-medium text-white">₹{mrrEstimate.toLocaleString()}</h3>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Active Subscriptions</p>
              <h3 className="text-2xl font-medium text-white">
                {(statsMap["pro"] || 0) + (statsMap["enterprise"] || 0)}
              </h3>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total Restaurants</p>
              <h3 className="text-2xl font-medium text-white">{totalRestaurants}</h3>
            </div>
          </div>
        </GlassPanel>
      </div>

      <h2 className="text-lg font-medium text-white mt-8 mb-4">Plan Distribution</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <GlassPanel key={plan.id} className={`p-6 border flex flex-col gap-4 ${plan.color.replace('text-', '').replace(/bg-[^ ]+ /, '')}`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${plan.color.split(' ')[1]} ${plan.color.split(' ')[0]}`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">{plan.count}</span>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white">{plan.name}</h3>
              <p className="text-zinc-400">{plan.price}</p>
            </div>
            
            <div className="mt-2 w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${plan.color.split(' ')[1].replace('/10', '')}`} 
                style={{ width: `${totalRestaurants ? (plan.count / totalRestaurants) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 text-right">
              {totalRestaurants ? ((plan.count / totalRestaurants) * 100).toFixed(1) : 0}% of total
            </p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
