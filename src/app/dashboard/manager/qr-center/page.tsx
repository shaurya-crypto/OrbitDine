"use client";

import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader } from "@/components/ui/Loader";
import { QrCode, Download, Printer, RefreshCw, XCircle } from "lucide-react";

export default function QrCenterPage() {
  const { restaurantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: qrs, isLoading, refetch } = useQuery({
    queryKey: ["qrs", restaurantId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/dashboard/manager/qrs/${restaurantId}`);
      return data.data;
    },
    enabled: !!restaurantId,
  });

  if (!mounted) return <div className="p-8 bg-zinc-950 min-h-screen text-white">Loading...</div>;

  const handleDownloadZip = () => {
    alert("Downloading ZIP of all active QRs...");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1 text-white flex items-center gap-3">
              <QrCode className="text-purple-400" size={32} />
              QR Management Center
            </h1>
            <p className="text-zinc-400 text-sm">Generate, track, and print table QRs</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Download size={16} /> Download All (ZIP)
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              <Printer size={16} /> Print Sheet
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12"><Loader /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800">
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Table</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">QR Code</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Scan Count</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Last Scanned</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {qrs?.map((qr: any) => (
                    <tr key={qr._id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4">
                        <div className="font-serif text-xl">{qr.tableId?.tableNumber || "N/A"}</div>
                        <div className="text-xs text-zinc-500">ID: {qr.code}</div>
                      </td>
                      <td className="p-4">
                        <img src={qr.qrImage} alt={`QR for Table ${qr.tableId?.tableNumber}`} className="w-16 h-16 rounded-lg bg-white p-1" />
                      </td>
                      <td className="p-4">
                        {qr.tableId?.activeSessionId && qr.tableId.status !== 'available' ? (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20">Active Session</span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full text-xs font-medium">Idle</span>
                        )}
                      </td>
                      <td className="p-4 text-zinc-300 font-mono">
                        {qr.scanCount || 0}
                      </td>
                      <td className="p-4 text-zinc-400 text-sm">
                        {qr.lastScanTime ? new Date(qr.lastScanTime).toLocaleString() : "Never"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Regenerate QR">
                            <RefreshCw size={16} />
                          </button>
                          <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Print QR">
                            <Printer size={16} />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Disable QR">
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
