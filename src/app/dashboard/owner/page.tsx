export default function OwnerDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary mb-2">Dashboard Overview</h1>
        <p className="text-text-secondary">Welcome back. Here's what's happening at your restaurant today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-1">Today's Revenue</h3>
          <div className="text-3xl font-medium text-text-primary">$1,248.00</div>
          <div className="text-xs text-green-500 mt-2 font-medium">+12% from yesterday</div>
        </div>
        
        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-1">Total Orders</h3>
          <div className="text-3xl font-medium text-text-primary">42</div>
          <div className="text-xs text-green-500 mt-2 font-medium">+5% from yesterday</div>
        </div>

        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-1">Active Tables</h3>
          <div className="text-3xl font-medium text-text-primary">12 / 20</div>
          <div className="text-xs text-text-secondary mt-2">60% capacity</div>
        </div>
      </div>

      {/* Recent Orders Placeholder */}
      <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
        <h2 className="text-lg font-medium text-text-primary mb-4">Recent Orders</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 bg-base rounded-xl border border-border">
            <div>
              <div className="font-medium text-text-primary">Table 4</div>
              <div className="text-sm text-text-secondary">2 items • 5 mins ago</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-text-primary">$42.50</div>
              <div className="text-xs text-amber-500 font-medium">Preparing</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-base rounded-xl border border-border">
            <div>
              <div className="font-medium text-text-primary">Table 12</div>
              <div className="text-sm text-text-secondary">4 items • 15 mins ago</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-text-primary">$128.00</div>
              <div className="text-xs text-green-500 font-medium">Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
