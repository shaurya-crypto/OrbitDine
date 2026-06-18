import { GlassPanel } from "@/components/ui/GlassPanel";
import { ShieldAlert, Flag, UserX, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminModerationPage() {
  return (
    <div className="p-8 pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-text-primary tracking-tight">Trust & Safety</h1>
        <p className="text-text-secondary mt-1">Review flagged content, manage suspensions, and ensure platform safety.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 border-border bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Active Reports</p>
            <h3 className="text-2xl font-semibold text-text-primary tracking-tight">0</h3>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-border bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-soft text-accent">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Suspended Accounts</p>
            <h3 className="text-2xl font-semibold text-text-primary tracking-tight">0</h3>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-border bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Auto-Flagged Activity</p>
            <h3 className="text-2xl font-semibold text-text-primary tracking-tight">0</h3>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="border-border bg-surface overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-medium text-text-primary">Moderation Queue</h2>
        </div>
        <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center min-h-[300px]">
          <ShieldAlert className="w-12 h-12 text-border mb-4" />
          <p>The moderation queue is currently empty.</p>
          <p className="text-sm mt-1">All flagged entities have been reviewed.</p>
        </div>
      </GlassPanel>
    </div>
  );
}
