"use client";

import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { Loader } from "@/components/ui/Loader";
import { Receipt, Check } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

export function BillRequestPanel({ restaurantId }: { restaurantId: string }) {
  const { data: sessions, isLoading } = useRealtimeSessions(restaurantId);
  const queryClient = useQueryClient();

  if (isLoading) return <div className="p-6 flex justify-center"><Loader /></div>;

  const billRequests = (sessions || []).filter((s: any) => s.status === "bill_requested" || s.billRequested === true);

  const handleGenerate = async (sessionId: string) => {
    try {
      await axios.post("/api/bill/generate", { sessionId, override: false });
      alert("Bill Generated! You can now print it.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
    } catch (err) {
      alert("Failed to generate bill.");
    }
  };

  const handleMarkPaid = async (sessionId: string) => {
    try {
      await axios.post("/api/sessions/close", { sessionId });
      alert("Session Closed and Table cleared.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
    } catch (err) {
      alert("Failed to close session.");
    }
  };

  if (billRequests.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-100">
        <Receipt className="mx-auto text-neutral-300 mb-3" size={32} />
        <h3 className="text-neutral-500 font-medium">No pending bill requests</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {billRequests.map((session: any) => (
        <div key={session._id} className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
          <div className="flex justify-between items-center mb-3 border-b border-neutral-100 pb-3">
            <div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-md uppercase tracking-wider">
                Table {session.tableId} {/* In a real app, populate tableNumber instead of ID */}
              </span>
            </div>
            <span className="text-xs text-neutral-500">
              {new Date(session.updatedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleGenerate(session._id)}
              className="flex-1 bg-neutral-900 text-white font-medium py-2 rounded-lg text-sm"
            >
              Generate Bill
            </button>
            <button 
              onClick={() => handleMarkPaid(session._id)}
              className="flex-1 bg-green-100 text-green-700 font-medium py-2 rounded-lg text-sm border border-green-200 flex items-center justify-center space-x-1"
            >
              <Check size={16} />
              <span>Mark Paid</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
