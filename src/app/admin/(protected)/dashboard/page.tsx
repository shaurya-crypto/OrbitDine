import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Order from "@/models/Order";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Users, Store, IndianRupee, ShoppingBag } from "lucide-react";
import { FeedClient } from "./FeedClient";
import { DashboardCharts } from "./DashboardCharts";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  await connectToDatabase();

  // 1. Fetch Plan Distribution Real Data
  const planStats = await Restaurant.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$plan", "free"] },
        count: { $sum: 1 },
      }
    }
  ]);

  const planMap = planStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const planData = [
    { name: 'Free', count: planMap["free"] || 0, mrr: 0 },
    { name: 'Pro', count: planMap["pro"] || 0, mrr: (planMap["pro"] || 0) * 2999 },
    { name: 'Enterprise', count: planMap["enterprise"] || 0, mrr: (planMap["enterprise"] || 0) * 9999 },
  ];

  // 2. Fetch Growth Data (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [userGrowth, restaurantGrowth] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } }
    ]),
    Restaurant.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } }
    ])
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthData = [];

  let runningUsers = 0;
  let runningRestaurants = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1; // 1-12
    const y = d.getFullYear();

    const uCount = userGrowth.find(x => x._id.month === m && x._id.year === y)?.count || 0;
    const rCount = restaurantGrowth.find(x => x._id.month === m && x._id.year === y)?.count || 0;

    runningUsers += uCount;
    runningRestaurants += rCount;

    growthData.push({
      name: monthNames[m - 1],
      users: runningUsers,
      restaurants: runningRestaurants,
    });
  }

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">Platform Growth</h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Users</div>
                <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Restaurants</div>
              </div>
            </div>
            <DashboardCharts planData={planData} growthData={growthData} />
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
