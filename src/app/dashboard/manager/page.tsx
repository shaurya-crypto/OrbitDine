export default function ManagerDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary mb-2">Manager Portal</h1>
        <p className="text-text-secondary">Oversee operations, menu availability, and staff.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel bg-surface/50 p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-medium text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
             <button className="p-4 bg-base border border-border rounded-xl text-left hover:border-accent transition-colors">
               <div className="font-medium text-text-primary mb-1">Update Menu</div>
               <div className="text-xs text-text-secondary">Toggle items availability</div>
             </button>
             <button className="p-4 bg-base border border-border rounded-xl text-left hover:border-accent transition-colors">
               <div className="font-medium text-text-primary mb-1">Manage Staff</div>
               <div className="text-xs text-text-secondary">View shifts and roles</div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
