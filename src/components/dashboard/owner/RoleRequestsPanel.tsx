"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Loader } from "@/components/ui/Loader";

interface RoleRequest {
  _id: string;
  userId: { _id: string; fullName: string; email: string };
  requestedRoles: string[];
  createdAt: string;
}

export function RoleRequestsPanel({ restaurantId }: { restaurantId: string }) {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useAuthStore();

  useEffect(() => {
    if (roles?.includes("owner") && restaurantId) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [roles, restaurantId]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/role-request?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/role-request/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader type="spinner" /></div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h2 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
        <ShieldAlert size={20} className="text-yellow-500" />
        Pending Staff Approvals
      </h2>
      {requests.length === 0 ? (
        <p className="text-zinc-500 text-sm py-4 text-center">No pending role requests at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div key={req._id} className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl flex flex-col justify-between">
              <div>
                <p className="font-medium text-white">{req.userId?.fullName || "Unknown User"}</p>
                <p className="text-xs text-zinc-400 mb-3">{req.userId?.email || "No email"}</p>
                <div className="flex gap-2 flex-wrap">
                  {req.requestedRoles?.map(r => (
                    <span key={r} className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                      r === "manager" ? "bg-blue-500/20 text-blue-400" :
                      r === "staff" ? "bg-green-500/20 text-green-400" :
                      "bg-orange-500/20 text-orange-400"
                    }`}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-700">
                <button 
                  onClick={() => handleAction(req._id, "reject")}
                  className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <X size={14} /> Reject
                </button>
                <button 
                  onClick={() => handleAction(req._id, "approve")}
                  className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Check size={14} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
