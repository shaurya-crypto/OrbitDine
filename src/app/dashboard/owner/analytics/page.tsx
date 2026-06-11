"use client";

import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, TrendingUp, TrendingDown, Clock, RefreshCw } from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';
type Section = 'revenue' | 'orders' | 'menu' | 'customers' | 'feedback' | 'discovery' | 'tables' | 'time' | 'operational';

export default function AnalyticsPage() {
  const { restaurantId } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('revenue');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/restaurant/analytics?restaurantId=${restaurantId}&section=${activeSection}&timeRange=${timeRange}`);
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, activeSection, timeRange]);

  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account.</div>;

  const tabs: { id: Section, label: string }[] = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'orders', label: 'Orders' },
    { id: 'menu', label: 'Menu Items' },
    { id: 'customers', label: 'Customers' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'tables', label: 'Tables' },
    { id: 'time', label: 'Time Insights' },
    { id: 'operational', label: 'Operations' },
    { id: 'discovery', label: 'Discovery' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 p-4 md:p-8 min-h-screen bg-base text-text-primary">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary mb-1">Business Intelligence</h1>
          <p className="text-text-secondary text-sm">Deep analytics and performance metrics</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <button onClick={fetchAnalytics} className="p-1.5 bg-surface border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <RefreshCw size={14} className={isLoading ? "animate-spin text-accent" : "text-text-secondary"} />
            </button>
          </div>
          <div className="flex bg-surface border border-border rounded-xl p-1 overflow-x-auto max-w-full">
            {['today', 'week', 'month', 'year', 'all'].map((range) => (
              <button 
                key={range}
                onClick={() => {
                  setData(null);
                  setTimeRange(range as TimeRange);
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${
                  timeRange === range ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setData(null);
              setActiveSection(tab.id);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === tab.id 
              ? "bg-accent/10 text-accent border border-accent/20" 
              : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-surface border border-border rounded-3xl p-6 min-h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-surface/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-accent" size={32} />
              <span className="text-sm text-text-secondary font-medium">Crunching numbers...</span>
            </div>
          </div>
        )}

        {!isLoading && data && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {activeSection === 'revenue' && <RevenueSection data={data} />}
            {activeSection === 'orders' && <OrdersSection data={data} />}
            {activeSection === 'menu' && <MenuSection data={data} />}
            {activeSection === 'customers' && <CustomersSection data={data} />}
            {activeSection === 'feedback' && <FeedbackSection data={data} />}
            {activeSection === 'tables' && <TablesSection data={data} />}
            {activeSection === 'time' && <TimeSection data={data} />}
            {activeSection === 'operational' && <OperationalSection data={data} />}
            {activeSection === 'discovery' && <DiscoverySection data={data} />}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EAB308'];

function RevenueSection({ data }: { data: any }) {
  const isPositive = parseFloat(data.growthPct) >= 0;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Revenue" value={`₹${data.revenuePeriod.toFixed(2)}`} />
        <MetricCard title="Previous Period" value={`₹${data.prevRevenuePeriod.toFixed(2)}`} />
        <MetricCard 
          title="Growth Rate" 
          value={`${isPositive ? '+' : ''}${data.growthPct}%`} 
          valueColor={isPositive ? "text-green-500" : "text-red-500"}
          icon={isPositive ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function OrdersSection({ data }: { data: any }) {
  const pieData = [
    { name: 'Completed', value: data.statusBreakdown.served },
    { name: 'Cancelled', value: data.statusBreakdown.cancelled },
    { name: 'Pending', value: data.statusBreakdown.received + data.statusBreakdown.preparing + data.statusBreakdown.ready },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard title="Total Orders" value={data.totalOrders} />
        <MetricCard title="Avg Order Value" value={`₹${data.aov.toFixed(2)}`} />
        <MetricCard title="Completion Rate" value={`${data.completionRate}%`} valueColor="text-green-500" />
        <MetricCard title="Cancellation Rate" value={`${data.cancellationRate}%`} valueColor="text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Order Status Distribution</h3>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSection({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium mb-4 text-green-500">Top 10 Bestsellers</h3>
        <div className="space-y-3">
          {data.topSellers.map((item: any, i: number) => (
            <div key={item._id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-border p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-accent font-bold">#{i+1}</span>
                <span className="font-medium text-text-primary">{item._id}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{item.totalSold} sold</div>
                <div className="text-xs text-text-secondary">₹{item.revenue.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {data.topSellers.length === 0 && <p className="text-text-secondary text-sm">No sales data in this period.</p>}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4 text-red-500">Items Needing Attention (Worst 10)</h3>
        <div className="space-y-3">
          {data.worstSellers.map((item: any, i: number) => (
            <div key={item._id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-border p-3 rounded-xl">
              <span className="font-medium text-text-primary">{item._id}</span>
              <div className="text-right">
                <div className="text-sm text-red-500 font-medium">{item.totalSold} sold</div>
              </div>
            </div>
          ))}
          {data.worstSellers.length === 0 && <p className="text-text-secondary text-sm">No sales data in this period.</p>}
        </div>
      </div>
    </div>
  );
}

function CustomersSection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard title="Total Customers" value={data.totalCustomers} />
        <MetricCard title="New Customers" value={data.newCustomers} />
        <MetricCard title="Returning Customers" value={data.returningCustomers} />
        <MetricCard title="Repeat Visit Rate" value={`${data.repeatVisitRate}%`} valueColor="text-blue-500" />
      </div>
      
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
        <h3 className="text-lg font-medium mb-2">Guest vs Registered Usage</h3>
        <p className="text-text-secondary text-sm mb-4">Tracking how many sessions were initiated via QR by guests vs users who created accounts.</p>
        <div className="flex gap-4">
          <div className="flex-1 p-4 bg-surface rounded-xl border border-border">
            <div className="text-3xl font-bold mb-1">{data.guestVisits}</div>
            <div className="text-sm text-text-secondary">Guest Sessions</div>
          </div>
          <div className="flex-1 p-4 bg-surface rounded-xl border border-border">
            <div className="text-3xl font-bold mb-1">{data.registeredVisits}</div>
            <div className="text-sm text-text-secondary">Registered User Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection({ data }: { data: any }) {
  const { restaurantId } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      if (!restaurantId) return;
      try {
        const res = await axios.get(`/api/restaurant/reviews?restaurantId=${restaurantId}`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [restaurantId]);

  const chartData = [1,2,3,4,5].map(stars => ({
    name: `${stars} Star`,
    count: data.distribution[stars] || 0
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard title="Average Rating" value={data.avgRating} icon={<span className="text-yellow-500 text-2xl">★</span>} />
        <MetricCard title="Total Reviews" value={data.count} />
        <MetricCard title="Positive (4-5★)" value={data.positiveReviews} valueColor="text-green-500" />
        <MetricCard title="Negative (1-2★)" value={data.negativeReviews} valueColor="text-red-500" />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
            <XAxis type="number" stroke="#888" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
            <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl overflow-hidden">
          {loadingReviews ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No text reviews found.</div>
          ) : (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {reviews.map((r: any) => (
                <div key={r._id} className="p-5 hover:bg-surface transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < r.rating ? "opacity-100" : "opacity-30"}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary">
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {r.feedback && <p className="text-sm text-text-primary leading-relaxed mt-2">{r.feedback}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TablesSection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard title="Total Sessions" value={data.totalSessions} />
        <MetricCard title="Avg Session Duration" value={`${data.avgSessionDurationMins} mins`} icon={<Clock className="text-blue-500" />} />
      </div>

      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Table Utilization</h3>
        <p className="text-text-secondary text-sm mb-4">Number of sessions hosted per table in this period.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {data.tableUtilization.map((t: any) => (
            <div key={t._id} className="bg-surface p-4 rounded-xl border border-border text-center flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-accent mb-1">{t.sessionCount}</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider truncate w-full" title={t._id}>Table {t._id.slice(-4)}</span>
            </div>
          ))}
          {data.tableUtilization.length === 0 && <p className="text-text-secondary text-sm col-span-full">No table data found.</p>}
        </div>
      </div>
    </div>
  );
}

function TimeSection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <MetricCard title="Peak Ordering Hour" value={data.peakHour} />
      
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Time Heatmap Data</h3>
        <p className="text-text-secondary text-sm mb-4">Raw grouping of orders by day of week and hour.</p>
        <div className="max-h-64 overflow-y-auto border border-border rounded-lg bg-surface">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-text-secondary border-b border-border sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium">Day of Week (1=Sun)</th>
                <th className="px-4 py-3 font-medium">Hour (0-23)</th>
                <th className="px-4 py-3 font-medium">Total Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.heatmap.map((h: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">{h._id.dayOfWeek}</td>
                  <td className="px-4 py-3">{h._id.hour}:00</td>
                  <td className="px-4 py-3 font-medium text-accent">{h.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OperationalSection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Orders Analyzed" value={data.totalOrdersProcessed} />
        <MetricCard title="Avg Prep Time" value={`${data.avgPrepTimeMins} mins`} valueColor="text-orange-500" />
        <MetricCard title="Avg Serve Time" value={`${data.avgServeTimeMins} mins`} valueColor="text-blue-500" />
      </div>
      
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Efficiency Funnel</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-text-secondary text-right">Received ➔ Ready</div>
            <div className="flex-1 h-6 bg-surface rounded-full overflow-hidden border border-border">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (data.avgPrepTimeMins/60)*100)}%` }}></div>
            </div>
            <div className="w-16 text-sm font-bold">{data.avgPrepTimeMins}m</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-text-secondary text-right">Ready ➔ Served</div>
            <div className="flex-1 h-6 bg-surface rounded-full overflow-hidden border border-border">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (data.avgServeTimeMins/30)*100)}%` }}></div>
            </div>
            <div className="w-16 text-sm font-bold">{data.avgServeTimeMins}m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverySection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium mb-4">Discovery & Marketing Events</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <MetricCard title="Restaurant Views" value={data.events.restaurant_view || 0} />
        <MetricCard title="Menu Opens" value={data.events.menu_open || 0} />
        <MetricCard title="Item Views" value={data.events.item_view || 0} />
        <MetricCard title="Item Clicks" value={data.events.item_click || 0} />
        <MetricCard title="Add to Cart" value={data.events.add_to_cart || 0} />
      </div>
    </div>
  );
}


// --- GENERIC UI COMPONENTS ---

function MetricCard({ title, value, icon, valueColor = "text-text-primary" }: { title: string, value: string | number, icon?: React.ReactNode, valueColor?: string }) {
  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl flex flex-col justify-between h-32 transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && <div>{icon}</div>}
      </div>
      <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</div>
    </div>
  );
}
