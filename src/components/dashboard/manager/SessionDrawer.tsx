"use client";

import { useDashboardStore } from "@/stores/dashboardStore";
import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { X, Receipt, LogOut, Ban, QrCode, RefreshCw, Trash2, Edit } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PrintQRCodeModal } from "./PrintQRCodeModal";
import { useAuthStore } from "@/stores/authStore";

export function SessionDrawer({ restaurantId }: { restaurantId: string }) {
  const { role } = useAuthStore();
  const { selectedTableId, setSelectedTable } = useDashboardStore();
  const { data: sessions } = useRealtimeSessions(restaurantId);
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);

  if (!selectedTableId) return null;

  // Find the active session for the selected table
  const activeSession = (sessions || []).find((s: any) => s.tableId === selectedTableId && ["active", "bill_requested"].includes(s.status));

  const handleCloseSession = async () => {
    if (!activeSession) return;
    if (confirm("Are you sure you want to forcibly close this session?")) {
      try {
        await axios.post("/api/sessions/close", { sessionId: activeSession._id });
        queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
        queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
        setSelectedTable(null);
      } catch (err) {
        alert("Failed to close session.");
      }
    }
  };

  const handleGenerateBill = async () => {
    if (!activeSession) return;
    try {
      await axios.post("/api/bill/generate", { sessionId: activeSession._id, override: true });
      alert("Bill generated.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
    } catch (err) {
      alert("Failed to generate bill.");
    }
  };

  const handleRegenerateQR = async () => {
    if (confirm("Are you sure you want to regenerate the QR code? Old QR codes will stop working.")) {
      try {
        await axios.post("/api/qr/regenerate", { tableId: selectedTableId });
        alert("QR Code regenerated.");
      } catch (err) {
        alert("Failed to regenerate QR.");
      }
    }
  };

  const handleDeleteTable = async () => {
    if (confirm("Are you sure you want to delete this table?")) {
      try {
        await axios.delete(`/api/tables?tableId=${selectedTableId}`);
        queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
        setSelectedTable(null);
      } catch (err) {
        alert("Failed to delete table. Make sure no active sessions exist.");
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-neutral-200 z-50 flex flex-col transform transition-transform">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
        <div>
          <h2 className="text-xl font-bold">Table Management</h2>
          <p className="text-sm text-neutral-500">ID: {selectedTableId}</p>
        </div>
        <button onClick={() => setSelectedTable(null)} className="p-2 bg-neutral-200 rounded-full hover:bg-neutral-300">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {!activeSession ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="mb-6">No active session on this table.</p>
            <button 
              onClick={() => setShowQR(true)}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <QrCode size={16} /> Print Table QR Code
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Session Active</p>
              <p className="text-sm text-blue-900">Started at: {new Date(activeSession.createdAt).toLocaleTimeString()}</p>
              <p className="text-sm text-blue-900">Status: {activeSession.status}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cart Contents</h3>
              {activeSession.cart.length === 0 ? (
                <p className="text-sm text-neutral-500">Cart is empty.</p>
              ) : (
                <div className="space-y-2">
                  {activeSession.cart.map((item: any) => (
                    <div key={item._id} className="flex justify-between text-sm border-b border-neutral-100 pb-2">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${item.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-2">
        <button 
          onClick={handleGenerateBill}
          disabled={!activeSession}
          className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Receipt size={18} />
          <span>Generate / Update Bill</span>
        </button>
        <button 
          onClick={handleCloseSession}
          disabled={!activeSession}
          className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-red-50"
        >
          <Ban size={18} />
          <span>Force Close Session</span>
        </button>

        {/* Staff Actions */}
        <button 
          onClick={handleRegenerateQR}
          className="w-full bg-white border border-neutral-200 text-neutral-700 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-neutral-50"
        >
          <RefreshCw size={18} />
          <span>Regenerate QR Code</span>
        </button>

        {/* Manager/Owner Actions */}
        {(role === "manager" || role === "owner") && (
          <button 
            onClick={handleDeleteTable}
            disabled={!!activeSession}
            className="w-full bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-red-100 mt-4"
          >
            <Trash2 size={18} />
            <span>Delete Table</span>
          </button>
        )}
      </div>
      {showQR && <PrintQRCodeModal tableId={selectedTableId} onClose={() => setShowQR(false)} />}
    </div>
  );
}
