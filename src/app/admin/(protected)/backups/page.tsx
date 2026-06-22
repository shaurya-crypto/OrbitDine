"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader2, Download, Trash2, ShieldCheck, Server, Database } from "lucide-react";

interface AdminBackupJob {
  _id: string;
  backupId: string;
  restaurantId: { _id: string; name: string };
  status: string;
  size: number;
  recordCount: number;
  createdAt: string;
}

export default function AdminBackupCenter() {
  const [jobs, setJobs] = useState<AdminBackupJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admin/backups/history");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = (jobId: string) => {
    window.open(`/api/backups/download/${jobId}`, "_blank");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = jobs.reduce((acc, job) => acc + (job.size || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
            Global Backup Fleet
          </h1>
          <p className="text-text-secondary mt-2">Enterprise administration of all tenant snapshots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Storage</p>
            <p className="text-2xl font-bold text-text-primary">{formatSize(totalSize)}</p>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Snapshots</p>
            <p className="text-2xl font-bold text-text-primary">{jobs.length}</p>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-0 overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-sm text-text-secondary uppercase tracking-wider">
                <th className="p-4 font-medium">Backup ID</th>
                <th className="p-4 font-medium">Restaurant</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Records</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">
                    <Loader2 size={24} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">
                    No backups found across the fleet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-surface transition-colors">
                    <td className="p-4 text-sm font-medium text-text-primary flex items-center gap-2">
                      <ShieldCheck size={16} className="text-purple-500" />
                      {job.backupId}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {job.restaurantId?.name || "Unknown"}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          job.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : job.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{formatSize(job.size)}</td>
                    <td className="p-4 text-sm text-text-secondary">{job.recordCount?.toLocaleString() || 0}</td>
                    <td className="p-4 text-sm text-text-secondary">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === "completed" && (
                          <button
                            onClick={() => handleDownload(job._id)}
                            className="p-2 text-text-secondary hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Download JSON.GZ"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
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
