"use client";

import { useDashboardStore } from "@/stores/dashboardStore";
import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { X, Receipt, LogOut, Ban, QrCode, RefreshCw, Trash2, Edit, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PrintQRCodeModal } from "./PrintQRCodeModal";
import { useAuthStore } from "@/stores/authStore";

import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";

export function SessionDrawer({ restaurantId }: { restaurantId: string }) {
  const { roles } = useAuthStore();
  const { selectedTableId, setSelectedTable } = useDashboardStore();
  const { data: sessions } = useRealtimeSessions(restaurantId);
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);
  const toast = useToast();
  const { confirm } = useConfirm();

  if (!selectedTableId) return null;

  // Find the active session for the selected table
  const activeSession = (sessions || []).find((s: any) => s.tableId === selectedTableId && ["active", "bill_requested"].includes(s.status));

  const handleCloseSession = async () => {
    if (!activeSession) return;
    const ok = await confirm({ title: "Close Session", message: "Are you sure you want to forcibly close this session?", isDanger: true });
    if (ok) {
      try {
        await axios.post("/api/sessions/close", { sessionId: activeSession._id });
        queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
        queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
        setSelectedTable(null);
        toast.success("Session closed successfully.");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to close session.");
      }
    }
  };

  const handleGenerateBill = async () => {
    if (!activeSession) return;
    try {
      await axios.post("/api/bill/generate", { sessionId: activeSession._id, override: true });
      toast.success("Bill generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["realtimeSessions", restaurantId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to generate bill.");
    }
  };

  const handleRegenerateQR = async () => {
    const ok = await confirm({ title: "Regenerate QR", message: "Are you sure you want to regenerate the QR code? Old QR codes will stop working.", isDanger: true });
    if (ok) {
      try {
        await axios.post("/api/qr/regenerate", { tableId: selectedTableId });
        toast.success("QR Code regenerated successfully.");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to regenerate QR.");
      }
    }
  };

  const handleDeleteTable = async () => {
    const ok = await confirm({ title: "Delete Table", message: "Are you sure you want to delete this table?", isDanger: true });
    if (ok) {
      try {
        await axios.delete(`/api/tables?tableId=${selectedTableId}`);
        queryClient.invalidateQueries({ queryKey: ["realtimeTables", restaurantId] });
        setSelectedTable(null);
        toast.success("Table deleted successfully.");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to delete table. Make sure no active sessions exist.");
      }
    }
  };

  const handleEmergencyAlert = async () => {
    const ok = await confirm({ title: "Emergency Alert", message: "Send an emergency alert to all staff for this table?", isDanger: true });
    if (ok) {
      try {
        await axios.post("/api/tables/emergency", { tableId: selectedTableId, restaurantId });
        toast.success("Emergency alert broadcasted!");
      } catch (err: any) {
        toast.error("Failed to send emergency alert");
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#fafafa] dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xl border-l border-neutral-200 dark:border-neutral-800 z-50 flex flex-col transform transition-transform">
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-800">
        <div>
          <h2 className="text-2xl font-bold font-sans">Table Management</h2>
          <p className="text-sm text-neutral-400 mt-1">ID: {selectedTableId}</p>
        </div>
        <button onClick={() => useDashboardStore.getState().setSelectedTable(null)} className="absolute top-6 right-6 text-white p-2 z-10 bg-neutral-600 hover:bg-neutral-700 rounded-full transition-colors border border-neutral-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-[#fafafa] dark:bg-neutral-900">
        {!activeSession ? (
          <div className="text-center py-16 text-neutral-500">
            <p className="mb-8 text-neutral-600 dark:text-neutral-400">No active session on this table.</p>
            <button 
              onClick={() => setShowQR(true)}
              className="px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <QrCode size={16} /> Print Table QR Code
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Session Active</p>
              <p className="text-sm text-blue-900 dark:text-blue-200">Started at: {new Date(activeSession.createdAt).toLocaleTimeString()}</p>
              <p className="text-sm text-blue-900 dark:text-blue-200">Status: {activeSession.status}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cart Contents</h3>
              {activeSession.cart.length === 0 ? (
                <p className="text-sm text-neutral-500">Cart is empty.</p>
              ) : (
                <div className="space-y-2">
                  {activeSession.cart.map((item: any) => (
                    <div key={item._id} className="flex justify-between text-sm border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-neutral-900 space-y-3">
        <button 
          onClick={handleGenerateBill}
          disabled={!activeSession}
          className="w-full bg-[#8b8b8b] dark:bg-neutral-700 text-white py-3.5 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-[#7a7a7a] dark:hover:bg-neutral-600 transition-colors"
        >
          <Receipt size={18} />
          <span>Generate / Update Bill</span>
        </button>
        <button 
          onClick={handleCloseSession}
          disabled={!activeSession}
          className="w-full bg-white dark:bg-neutral-800 border border-[#ffcfd7] dark:border-red-900/50 text-[#ff778b] dark:text-red-400 py-3.5 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Ban size={18} />
          <span>Force Close Session</span>
        </button>

        {/* Staff Actions */}
        <button 
          onClick={handleRegenerateQR}
          className="w-full bg-white dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 text-[#555555] dark:text-neutral-300 py-3.5 rounded-2xl font-medium flex items-center justify-center space-x-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Regenerate QR Code</span>
        </button>
        
        <button 
          onClick={handleEmergencyAlert}
          className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 text-orange-600 dark:text-orange-400 py-3.5 rounded-2xl font-medium flex items-center justify-center space-x-2 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors mt-2 shadow-sm"
        >
          <AlertTriangle size={18} />
          <span>Alert Staff (Emergency Stuck)</span>
        </button>

        {/* Manager/Owner Actions */}
        {(roles?.includes("manager") || roles?.includes("owner")) && (
          <button 
            onClick={handleDeleteTable}
            disabled={!!activeSession}
            className="w-full bg-[#fff4f5] dark:bg-red-900/10 border border-[#ffcfd7] dark:border-red-900/30 text-[#ff3355] dark:text-red-400 py-3.5 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-[#ffeef0] dark:hover:bg-red-900/20 mt-6 transition-colors"
          >
            <Trash2 size={18} />
            <span>Delete Table</span>
          </button>
        )}
      </div>
      {showQR && <PrintQRCodeModal tableId={selectedTableId as string} onClose={() => setShowQR(false)} />}
    </div>
  );
}
