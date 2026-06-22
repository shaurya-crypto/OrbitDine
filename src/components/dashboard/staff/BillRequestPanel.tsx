"use client";

import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { SkeletonCard } from "@/components/dashboard/ui/Skeleton";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
import { Receipt, Check } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/ToastProvider";

export function BillRequestPanel({ restaurantId }: { restaurantId: string }) {
  const { data: sessions, isLoading } = useRealtimeSessions(restaurantId);
  const queryClient = useQueryClient();
  const toast = useToast();

  if (isLoading) return <div className="space-y-3"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>;

  const billRequests = (sessions || []).filter((s: any) => s.status === "bill_requested" || s.billRequested === true);

  const handleGenerate = async (sessionId: string) => {
    try {
      await axios.post("/api/bill/generate", { sessionId, override: false });
      toast.success("Bill Generated! You can now print it.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
    } catch (err) {
      toast.error("Failed to generate bill.");
    }
  };

  const handleMarkPaid = async (sessionId: string) => {
    try {
      await axios.post("/api/sessions/close", { sessionId });
      toast.success("Session Closed and Table cleared.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
    } catch (err) {
      toast.error("Failed to close session.");
    }
  };

  if (billRequests.length === 0) {
    return (
      <div className="card">
        <EmptyState 
          icon={Receipt} 
          title="No pending requests" 
          description="Active bill requests will appear here."
          compact
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {billRequests.map((session: any) => (
        <div key={session._id} className="card p-4 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[11px] font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded uppercase tracking-wider">
                Table {session.tableId?.tableNumber || session.tableId}
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary font-medium">
              {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleGenerate(session._id)}
              className="flex-1 bg-elevated border border-border text-text-primary font-medium rounded-xl text-[13px] hover:bg-hover transition-colors min-h-[36px]"
            >
              Generate Bill
            </button>
            <button 
              onClick={() => handleMarkPaid(session._id)}
              className="flex-1 bg-emerald-500/10 text-emerald-500 font-medium rounded-xl text-[13px] hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5 min-h-[36px]"
            >
              <Check size={14} />
              Mark Paid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
