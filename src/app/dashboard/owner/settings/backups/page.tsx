"use client";

import { useState, useEffect } from "react";
import { Database, Download, RefreshCw, AlertTriangle, CheckCircle2, Copy, FileJson, Clock, Loader2, Trash2, ShieldCheck, PlayCircle, History } from "lucide-react";

interface BackupJob {
  _id: string;
  backupId: string;
  status: string;
  size: number;
  recordCount: number;
  createdAt: string;
}

export default function OwnerBackupCenter() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [restoreJobId, setRestoreJobId] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState<BackupJob | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");
  const [restoring, setRestoring] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/owner/backups/history");
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
    const interval = setInterval(fetchHistory, 5000); // Poll for status updates
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/owner/backups/create", { method: "POST" });
      if (res.ok) {
        fetchHistory();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert("Failed to generate backup");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (jobId: string) => {
    window.open(`/api/backups/download/${jobId}`, "_blank");
  };

  const handleRestore = async () => {
    if (!showRestoreModal || restoreConfirmText !== "RESTORE") return;
    setRestoring(true);
    try {
      const res = await fetch("/api/owner/backups/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId: showRestoreModal._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRestoreJobId(data.jobId);
        setShowRestoreModal(null);
        alert("Restore initiated! A pre-restore emergency backup is being created, followed by the data restoration.");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert("Failed to initiate restore");
    } finally {
      setRestoring(false);
      setRestoreConfirmText("");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
            Enterprise Backups
          </h1>
          <p className="text-text-secondary mt-2">Manage your restaurant's data snapshots and disaster recovery.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-3 bg-text-primary text-surface rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
          Generate Snapshot
        </button>
      </div>

      <div className="card p-0 overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-sm text-text-secondary uppercase tracking-wider">
                <th className="p-4 font-medium">Backup ID</th>
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
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    <Loader2 size={24} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No backups found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-surface transition-colors">
                    <td className="p-4 text-sm font-medium text-text-primary flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      {job.backupId}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          job.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : job.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700 animate-pulse"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{formatSize(job.size)}</td>
                    <td className="p-4 text-sm text-text-secondary">{job.recordCount.toLocaleString()}</td>
                    <td className="p-4 text-sm text-text-secondary">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === "completed" && (
                          <>
                            <button
                              onClick={() => setShowRestoreModal(job)}
                              className="p-2 text-text-secondary hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Restore Backup"
                            >
                              <History size={18} />
                            </button>
                            <button
                              onClick={() => handleDownload(job._id)}
                              className="p-2 text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Download JSON.GZ"
                            >
                              <Download size={18} />
                            </button>
                          </>
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
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-xl">
              <AlertTriangle size={24} className="shrink-0" />
              <div>
                <h3 className="font-bold">Dangerous Operation</h3>
                <p className="text-sm opacity-90 mt-1">
                  Restoring will overwrite current live data with the snapshot from{" "}
                  {new Date(showRestoreModal.createdAt).toLocaleString()}. 
                  An emergency backup will be taken before restoring.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Type <strong className="text-text-primary select-all">RESTORE</strong> to confirm:
              </label>
              <input
                type="text"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-red-500 transition-colors"
                placeholder="RESTORE"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowRestoreModal(null);
                  setRestoreConfirmText("");
                }}
                disabled={restoring}
                className="px-5 py-2.5 text-text-secondary hover:text-text-primary font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={restoreConfirmText !== "RESTORE" || restoring}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {restoring ? <Loader2 size={18} className="animate-spin" /> : <History size={18} />}
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
