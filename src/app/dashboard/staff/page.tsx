export default function StaffDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary mb-2">Staff Portal</h1>
        <p className="text-text-secondary">Manage active orders and tables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-medium text-text-primary mb-4">Pending Orders</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-base rounded-xl border border-amber-500/30">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-amber-500">New Order • Table 7</span>
                <span className="text-sm text-text-secondary">2m ago</span>
              </div>
              <p className="text-text-primary mb-4">1x Truffle Pasta, 2x Garlic Bread</p>
              <button className="w-full py-2 bg-text-primary text-base font-medium rounded-lg">Accept Order</button>
            </div>
          </div>
        </div>

        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-medium text-text-primary mb-4">Table Status</h2>
          <div className="grid grid-cols-4 gap-4">
             {/* Stub tables */}
             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-medium ${i === 7 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-base border border-border text-text-secondary'}`}>
                 T{i}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
