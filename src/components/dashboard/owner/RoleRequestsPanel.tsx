"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ShieldAlert, Check, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Loader } from "@/components/ui/Loader";

interface RoleRequest {
  _id: string;
  userId: { _id: string; fullName: string; email: string };
  requestedRole: string;
  createdAt: string;
}

export function RoleRequestsPanel({ restaurantId }: { restaurantId: string }) {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "owner" && restaurantId) {
      fetchRequests();
    }
  }, [role, restaurantId]);

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

  if (loading) return <Loader type="spinner" />;
  if (requests.length === 0) return null; // Hide panel if no requests

  return (
    <div className="mb-8">
      <h2 className="text-xl font-serif text-neutral-900 mb-4 flex items-center gap-2">
        <ShieldAlert size={20} className="text-yellow-600" />
        Pending Staff Approvals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => (
          <GlassPanel key={req._id} className="p-4 border-yellow-500/20 bg-yellow-50/50 flex flex-col justify-between">
            <div>
              <p className="font-medium text-neutral-900">{req.userId?.fullName || "Unknown User"}</p>
              <p className="text-xs text-neutral-500 mb-3">{req.userId?.email || "No email"}</p>
              <p className="text-sm">Requested Role: <span className="font-semibold uppercase tracking-wider text-xs">{req.requestedRole}</span></p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-200">
              <button 
                onClick={() => handleAction(req._id, "reject")}
                className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
              >
                <X size={14} /> Reject
              </button>
              <button 
                onClick={() => handleAction(req._id, "approve")}
                className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors"
              >
                <Check size={14} /> Approve
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
