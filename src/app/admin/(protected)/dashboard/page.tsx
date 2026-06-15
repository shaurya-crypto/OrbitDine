import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Order from "@/models/Order";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Users, Store, IndianRupee, ShoppingBag } from "lucide-react";
import { FeedClient } from "./FeedClient"; // We'll create this client component

export const dynamic = "force-dynamic";

export default function SuperAdminDashboard() {
  return (
    <div className="p-8 pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-tight">Platform Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time metrics and global activity.</p>
      </div>

      {/* Server Component wrapped KPI fetching for speed */}
      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
            <h2 className="text-xl font-medium text-white mb-6">Revenue Growth (Coming Soon)</h2>
            <div className="h-64 flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              [Recharts Area Graph implementation pending]
            </div>
          </GlassPanel>
        </div>
        
        <div className="col-span-1">
          <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50 h-full">
            <h2 className="text-xl font-medium text-white mb-6">Live Activity</h2>
            {/* The client component that connects to SSE */}
            <FeedClient />
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

// Extract data fetching into an async component
async function KPICards() {
  await connectToDatabase();

  const [
    totalRestaurants,
    totalUsers,
    totalOrders,
    revenueData
  ] = await Promise.all([
    Restaurant.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["delivered", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  const kpis = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Restaurants", value: totalRestaurants.toLocaleString(), icon: Store, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <GlassPanel key={idx} className="p-6 border-zinc-800/50 bg-zinc-900/50 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
              <Icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">{kpi.label}</p>
              <h3 className="text-2xl font-semibold text-white tracking-tight">{kpi.value}</h3>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}
