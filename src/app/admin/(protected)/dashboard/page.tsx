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
    <div className="p-6 pb-20 space-y-6">
      <div>
        <h1 className="text-page-title text-text-primary">Platform Overview</h1>
        <p className="text-caption text-text-secondary mt-0.5">Real-time metrics and global activity.</p>
      </div>

      {/* Server Component wrapped KPI fetching for speed */}
      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-section-title text-text-primary">Platform Growth</h2>
              <div className="flex items-center gap-4 text-[11px] font-medium">
                <div className="flex items-center gap-1.5 text-text-tertiary"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Users</div>
                <div className="flex items-center gap-1.5 text-text-tertiary"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Restaurants</div>
              </div>
            </div>
            <DashboardCharts planData={planData} growthData={growthData} />
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="card p-5 h-full">
            <h2 className="text-section-title text-text-primary mb-4">Live Activity</h2>
            <FeedClient />
          </div>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg}`}>
              <Icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-caption text-text-secondary">{kpi.label}</p>
              <h3 className="text-metric-value text-text-primary">{kpi.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
