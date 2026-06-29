"use client";

import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import { apiClient as axios } from "@/services/apiClient";
import { Loader2, TrendingUp, TrendingDown, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';
type Section = 'revenue' | 'orders' | 'menu' | 'customers' | 'audience' | 'feedback' | 'discovery' | 'tables' | 'time' | 'operational' | 'ai_insights';

export default function AnalyticsPage() {
  const { restaurantId } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('revenue');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`/restaurant/analytics?restaurantId=${restaurantId}&section=${activeSection}&timeRange=${timeRange}`);
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, activeSection, timeRange]);

  if (!restaurantId) return <div className="p-8 bg-base min-h-screen text-red-500">Error: No Restaurant ID linked to your account.</div>;

  const tabs: { id: Section, label: string }[] = [
    { id: 'revenue', label: 'Revenue Intel' },
    { id: 'customers', label: 'Customer Intel' },
    { id: 'audience', label: 'Audience Deep Dive' },
    { id: 'feedback', label: 'Feedback & Reviews' },
    { id: 'operational', label: 'Kitchen & Operations' },
    { id: 'ai_insights', label: 'AI Insights' },
    { id: 'orders', label: 'Orders' },
    { id: 'menu', label: 'Menu Items' },
    { id: 'tables', label: 'Tables' },
    { id: 'time', label: 'Time Insights' },
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
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
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
            { activeSection === 'revenue' && <RevenueSection data={data} /> }
            { activeSection === 'orders' && <OrdersSection data={data} /> }
            { activeSection === 'menu' && <MenuSection data={data} /> }
            { activeSection === 'customers' && <CustomersSection data={data} /> }
            { activeSection === 'audience' && <AudienceSection data={data} /> }
            { activeSection === 'feedback' && <FeedbackSection data={data} /> }
            { activeSection === 'tables' && <TablesSection data={data} /> }
            { activeSection === 'time' && <TimeSection data={data} /> }
            { activeSection === 'operational' && <OperationalSection data={data} /> }
            { activeSection === 'discovery' && <DiscoverySection data={data} /> }
            { activeSection === 'ai_insights' && <AIInsightsSection data={data} /> }
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
  
  // Combine historical and forecast data for the chart
  const mergedChartData = [...(data.chartData || [])];
  if (data.upcomingForecasts) {
    data.upcomingForecasts.forEach((f: any) => {
      mergedChartData.push({
        date: f.date,
        predictedRevenue: f.predictedRevenue,
        predictedOrders: f.predictedOrders
      });
    });
  }

  const confidenceScore = data.upcomingForecasts?.length > 0 ? data.upcomingForecasts[0].confidence : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`₹${data.revenuePeriod.toFixed(2)}`} />
        <MetricCard title="Estimated Profit" value={`₹${((data.revenuePeriod || 0) * 0.4).toFixed(2)}`} valueColor="text-green-500" />
        <MetricCard title="Est. COGS" value={`₹${((data.revenuePeriod || 0) * 0.35).toFixed(2)}`} valueColor="text-orange-500" />
        <MetricCard 
          title="Growth Rate" 
          value={`${isPositive ? '+' : ''}${data.growthPct}%`} 
          valueColor={isPositive ? "text-green-500" : "text-red-500"}
          icon={isPositive ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Revenue & Forecast Trend</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={mergedChartData}>
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
            <Area type="monotone" dataKey="predictedRevenue" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
        </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-4">Next 7 Days Forecast</h3>
          <div className="space-y-4 w-full relative">
            {data.upcomingForecasts && data.upcomingForecasts.map((forecast: any, idx: number) => {
               const dayName = new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'long' });
               const isUp = idx > 0 && forecast.predictedRevenue > data.upcomingForecasts[idx - 1].predictedRevenue;
               return (
                 <div key={idx} className="flex justify-between items-center pb-2 border-b border-border/50">
                   <span className="text-text-secondary">{idx === 0 ? "Tomorrow" : dayName}</span>
                   <span className="text-accent font-bold">
                     ~₹{forecast.predictedRevenue.toLocaleString()} 
                     {isUp && <TrendingUp size={14} className="inline text-green-500 ml-1"/>}
                   </span>
                 </div>
               );
            })}
            {(!data.upcomingForecasts || data.upcomingForecasts.length === 0) && (
              <p className="text-text-secondary text-sm">No forecast data generated yet. Nightly CRON required.</p>
            )}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-text-secondary">Confidence Score: <span className="text-green-500 font-bold">{confidenceScore}%</span></p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-3">
          <h3 className="text-lg font-medium mb-4">Orders Volume Over Time</h3>
          <div className="w-full bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mergedChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="orders" name="Actual Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictedOrders" name="Predicted Orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-medium mb-4 text-green-500">Top Bestsellers</h3>
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
          {(!data.worstSellers || data.worstSellers.length === 0) && <p className="text-text-secondary text-sm">No sales data in this period.</p>}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4 text-purple-500">Trending Items</h3>
        <div className="space-y-3">
          {data.trending && data.trending.map((item: any, i: number) => (
            <div key={item._id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-border p-3 rounded-xl">
              <span className="font-medium text-text-primary">{item._id}</span>
              <div className="text-right">
                <div className="text-sm text-purple-500 font-medium">Score: {item.popularityScore.toFixed(0)}</div>
              </div>
            </div>
          ))}
          {(!data.trending || data.trending.length === 0) && <p className="text-text-secondary text-sm">Not enough event data yet.</p>}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4 text-blue-500">Hidden Gems</h3>
        <p className="text-xs text-text-secondary mb-2">High conversion, low visibility</p>
        <div className="space-y-3">
          {data.hiddenGems && data.hiddenGems.map((item: any, i: number) => (
            <div key={item._id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-border p-3 rounded-xl">
              <span className="font-medium text-text-primary">{item._id}</span>
              <div className="text-right">
                <div className="text-sm text-blue-500 font-medium">{item.conversionRate.toFixed(1)}% Conv</div>
              </div>
            </div>
          ))}
          {(!data.hiddenGems || data.hiddenGems.length === 0) && <p className="text-text-secondary text-sm">No hidden gems detected.</p>}
        </div>
      </div>

      <div className="md:col-span-2 xl:col-span-4 mt-8">
        <h3 className="text-lg font-medium mb-4">Top Sellers Volume</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topSellers.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Bar dataKey="totalSold" name="Total Sold" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CustomersSection({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <MetricCard title="Total Customers" value={data.totalCustomers || 0} />
        <MetricCard title="New Customers" value={data.newCustomers || 0} />
        <MetricCard title="Avg LTV" value={`₹${(data.avgLtv || 0).toFixed(2)}`} />
        <MetricCard title="Churn Risk" value={`${data.avgChurnRisk || 0}%`} valueColor={data.avgChurnRisk > 20 ? "text-red-500" : "text-orange-500"} />
        <MetricCard title="Repeat Visit Rate" value={`${data.repeatVisitRate || 0}%`} valueColor="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
          <h3 className="text-lg font-medium mb-4">Customer Segments</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'VIP', value: data.segmentDistribution?.vip || 0, fill: '#8B5CF6' },
                    { name: 'Loyal', value: data.segmentDistribution?.loyal || 0, fill: '#3B82F6' },
                    { name: 'Regular', value: data.segmentDistribution?.regular || 0, fill: '#10B981' },
                    { name: 'At Risk', value: data.segmentDistribution?.at_risk || 0, fill: '#EF4444' }
                  ].filter(d => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  {
                    [
                      { name: 'VIP', value: data.segmentDistribution?.vip || 0, fill: '#8B5CF6' },
                      { name: 'Loyal', value: data.segmentDistribution?.loyal || 0, fill: '#3B82F6' },
                      { name: 'Regular', value: data.segmentDistribution?.regular || 0, fill: '#10B981' },
                      { name: 'At Risk', value: data.segmentDistribution?.at_risk || 0, fill: '#EF4444' }
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
          <h3 className="text-lg font-medium mb-4">Retention Cohorts (30-60-90)</h3>
          <div className="w-full relative">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-text-secondary border-b border-border sticky top-0">
                <tr>
                  <th className="py-2 px-2">Cohort Month</th>
                  <th className="py-2 px-2">Size</th>
                  <th className="py-2 px-2">Day 30</th>
                  <th className="py-2 px-2">Day 60</th>
                  <th className="py-2 px-2">Day 90</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.cohorts && data.cohorts.map((c: any) => (
                  <tr key={c._id}>
                    <td className="py-2 px-2 font-medium">{c.cohortMonth}</td>
                    <td className="py-2 px-2">{c.cohortSize}</td>
                    <td className="py-2 px-2 text-green-500 bg-green-500/5">{c.day30RetentionPct}%</td>
                    <td className="py-2 px-2 text-green-500 bg-green-500/5">{c.day60RetentionPct}%</td>
                    <td className="py-2 px-2 text-green-500 bg-green-500/5">{c.day90RetentionPct}%</td>
                  </tr>
                ))}
                {(!data.cohorts || data.cohorts.length === 0) && (
                  <tr><td colSpan={5} className="py-4 text-center text-text-secondary">No cohort data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
  const toast = useToast();

  useEffect(() => {
    async function fetchReviews() {
      if (!restaurantId) return;
      try {
        const response = await axios.get(`/restaurant/reviews?restaurantId=${restaurantId}`);
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
        toast.error("Failed to load reviews.");
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [restaurantId]);

  const chartData = [1,2,3,4,5].map(stars => ({
    name: `${stars} Star`,
    count: data.distribution?.[stars] || 0
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard title="Average Rating" value={data.avgRating} icon={<span className="text-yellow-500 text-2xl">★</span>} />
        <MetricCard title="Total Reviews" value={data.count} />
        <MetricCard title="Positive (4-5★)" value={data.positiveReviews} valueColor="text-green-500" />
        <MetricCard title="Negative (1-2★)" value={data.negativeReviews} valueColor="text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <h3 className="text-lg font-medium mb-4">Sentiment & Keyword Cloud</h3>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6 h-[300px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
               <span className="text-text-primary font-medium">Global Sentiment Score</span>
               <span className="text-green-500 font-bold text-xl">{data.globalSentimentScore || 0}/100</span>
            </div>
            <div className="flex flex-wrap gap-2 content-start flex-1 mt-4 w-full relative">
               {data.keywords && data.keywords.map((kw: any) => (
                 <span key={kw.text} className={`px-3 py-1 border rounded-full ${
                   kw.type === 'positive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                   kw.type === 'negative' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                   'bg-zinc-100 dark:bg-zinc-800 text-text-secondary border-border'
                 } ${kw.count > 10 ? 'text-xl font-bold' : kw.count > 5 ? 'text-lg' : 'text-sm'}`}>
                   {kw.text}
                 </span>
               ))}
               {(!data.keywords || data.keywords.length === 0) && (
                 <span className="text-sm text-text-secondary">No keyword data extracted yet.</span>
               )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
          {loadingReviews ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No text reviews found.</div>
          ) : (
            <div className="divide-y divide-border w-full relative">
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

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Review Trend Over Time</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.reviewTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" domain={[0, 5]} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgRating" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} name="Avg Rating" />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} name="Total Reviews" />
            </LineChart>
          </ResponsiveContainer>
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
        <div className="w-full relative border border-border rounded-lg bg-surface">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Orders Analyzed" value={data.totalOrdersProcessed} />
        <MetricCard title="Avg Prep Time" value={`${data.avgPrepTimeMins} mins`} valueColor="text-orange-500" />
        <MetricCard title="Avg Serve Time" value={`${data.avgServeTimeMins} mins`} valueColor="text-blue-500" />
        <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl flex flex-col justify-between h-32 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-accent">Health Score</span>
            <span className="text-2xl font-bold text-accent">{data.health?.grade || 'N/A'}</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-accent">{data.health?.score || 0}<span className="text-lg opacity-50">/100</span></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
           <h3 className="text-lg font-medium mb-4">Operations Alerts</h3>
           <ul className="space-y-3 w-full relative">
             {data.health?.insights?.map((insight: any, i: number) => (
               <li key={i} className="flex gap-2 items-start text-sm text-text-primary">
                  <span className={`mt-0.5 ${insight.type === 'negative' ? 'text-red-500' : insight.type === 'positive' ? 'text-green-500' : 'text-orange-500'}`}>
                    {insight.type === 'negative' ? '⚠️' : insight.type === 'positive' ? '✅' : '⏱️'}
                  </span> 
                  <span>{insight.message}</span>
               </li>
             ))}
             {(!data.health?.insights || data.health?.insights.length === 0) && (
               <li className="text-sm text-text-secondary">No current alerts.</li>
             )}
           </ul>
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

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Conversion Funnel</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl p-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { step: 'Restaurant Views', count: data.events.restaurant_view || 0 },
                { step: 'Menu Opens', count: data.events.menu_open || 0 },
                { step: 'Item Views', count: data.events.item_view || 0 },
                { step: 'Add to Cart', count: data.events.add_to_cart || 0 }
              ]}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
              <XAxis type="number" stroke="#888" fontSize={12} />
              <YAxis dataKey="step" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Bar dataKey="count" name="Events" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


function AIInsightsSection({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-serif">Smart Recommendations</h2>
          <p className="text-sm text-text-secondary">AI-generated operational insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.recommendations && data.recommendations.map((rec: any, idx: number) => {
          let colorClass = "bg-blue-500/5 border-blue-500/20 text-blue-500";
          let btnClass = "bg-blue-500 hover:bg-blue-600";
          
          if (rec.type === "negative" || rec.severity === "high") {
            colorClass = "bg-red-500/5 border-red-500/20 text-red-500";
            btnClass = "bg-red-500 hover:bg-red-600";
          } else if (rec.type === "positive") {
            colorClass = "bg-green-500/5 border-green-500/20 text-green-500";
            btnClass = "bg-green-500 hover:bg-green-600";
          }

          return (
            <div key={idx} className={`p-6 border rounded-2xl ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
              <h3 className={`font-bold mb-2 ${colorClass.split(' ')[2]}`}>{rec.title}</h3>
              <p className="text-text-primary text-sm leading-relaxed mb-4">
                {rec.explanation}
              </p>
              <button className={`text-xs text-white px-4 py-2 rounded-lg font-medium transition-colors ${btnClass}`}>
                {rec.recommendedAction}
              </button>
            </div>
          );
        })}

        {(!data.recommendations || data.recommendations.length === 0) && (
          <div className="col-span-full p-8 text-center text-text-secondary border border-border rounded-2xl">
            No active recommendations at this time.
          </div>
        )}
      </div>
    </div>
  );
}

function AudienceSection({ data }: { data: any }) {
  if (!data) return null;
  
  const churnData = [
    { name: 'Low Risk', value: data.churnRiskBuckets?.low || 0, fill: '#10B981' },
    { name: 'Medium Risk', value: data.churnRiskBuckets?.medium || 0, fill: '#F59E0B' },
    { name: 'High Risk', value: data.churnRiskBuckets?.high || 0, fill: '#EF4444' },
    { name: 'Critical', value: data.churnRiskBuckets?.critical || 0, fill: '#7F1D1D' }
  ];

  const dietaryData = [
    { name: 'Vegan', value: data.dietaryBuckets?.vegan || 0, fill: '#10B981' },
    { name: 'Vegetarian', value: data.dietaryBuckets?.vegetarian || 0, fill: '#84CC16' },
    { name: 'Keto', value: data.dietaryBuckets?.keto || 0, fill: '#3B82F6' },
    { name: 'High Protein', value: data.dietaryBuckets?.high_protein || 0, fill: '#8B5CF6' },
    { name: 'Gluten Free', value: data.dietaryBuckets?.gluten_free || 0, fill: '#F59E0B' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Churn Risk Distribution */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
          <h3 className="text-lg font-medium mb-1">AI Churn Risk Breakdown</h3>
          <p className="text-text-secondary text-sm mb-6">Distribution of customers based on ML churn predictions</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                  {churnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dietary Preferences Graph */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
          <h3 className="text-lg font-medium mb-1">Audience Dietary Preferences</h3>
          <p className="text-text-secondary text-sm mb-6">Based on actual user favorite items and order history tags</p>
          <div className="h-[250px] w-full">
            {dietaryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dietaryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dietaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary">Not enough dietary data collected yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-2xl">
        <h3 className="text-lg font-medium mb-1">Top Customers by Lifetime Value (LTV)</h3>
        <p className="text-text-secondary text-sm mb-6">Real-time DB query tracking your highest-value diners.</p>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-text-secondary border-b border-border">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg font-medium">Customer Identity</th>
                <th className="py-3 px-4 font-medium">Segment</th>
                <th className="py-3 px-4 font-medium">Visit Freq</th>
                <th className="py-3 px-4 font-medium">Avg Order Val</th>
                <th className="py-3 px-4 rounded-tr-lg font-medium text-right">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.topCustomers && data.topCustomers.map((c: any) => (
                <tr key={c._id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-text-primary">{c.fullName || "Anonymous"}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{c.email || "No email"}</div>
                  </td>
                  <td className="py-4 px-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.customerSegment === 'vip' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {c.customerSegment || "New"}
                    </span>
                  </td>
                  <td className="py-4 px-4">{c.visitFrequency || 1} visits</td>
                  <td className="py-4 px-4">₹{(c.averageOrderValue || 0).toFixed(2)}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-500">₹{(c.lifetimeValue || 0).toFixed(2)}</td>
                </tr>
              ))}
              {(!data.topCustomers || data.topCustomers.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-text-secondary">No customer data matched. Wait for orders to accumulate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
