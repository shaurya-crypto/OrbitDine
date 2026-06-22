"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader2, History, AlertTriangle, PlayCircle, Activity } from "lucide-react";

interface RestoreJob {
  _id: string;
  jobId: string;
  restaurantId: { _id: string; name: string };
  snapshotId: string;
  status: string;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  createdAt: string;
  failureReason?: string;
  actorRole: string;
}

export default function AdminRecoveryCenter() {
  const [jobs, setJobs] = useState<RestoreJob[]>([]);
  const [loading, setLoading] = useState(true);

  // We are keeping it simple for the implementation.
  // In a real scenario, this would have search, pagination, and a modal to trigger restore.

  useEffect(() => {
    // In a full implementation, you'd fetch from /api/admin/backups/restore/history
    // For now, we simulate an empty state or fetch if endpoint exists.
    setLoading(false);
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
            Disaster Recovery Center
          </h1>
          <p className="text-text-secondary mt-2">Enterprise-grade tenant recovery and snapshot restoration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Active Restores</p>
            <p className="text-2xl font-bold text-text-primary">0</p>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <History size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Completed Restores</p>
            <p className="text-2xl font-bold text-text-primary">0</p>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-0 overflow-hidden border-border">
        <div className="p-6 border-b border-border bg-surface flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          <h2 className="font-semibold text-text-primary">Global Recovery Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-sm text-text-secondary uppercase tracking-wider">
                <th className="p-4 font-medium">Job ID</th>
                <th className="p-4 font-medium">Restaurant</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Initiator</th>
                <th className="p-4 font-medium">Processed</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    <Loader2 size={24} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No recovery operations have been logged.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-surface transition-colors">
                    <td className="p-4 text-sm font-medium text-text-primary">{job.jobId}</td>
                    <td className="p-4 text-sm text-text-secondary">{job.restaurantId?.name || "Unknown"}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary capitalize">{job.actorRole}</td>
                    <td className="p-4 text-sm text-text-secondary">{job.recordsProcessed.toLocaleString()}</td>
                    <td className="p-4 text-sm text-text-secondary">{new Date(job.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
