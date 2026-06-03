"use client";

import QRCode from "react-qr-code";
import { X, Printer } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

import { useState, useEffect } from "react";

interface PrintQRCodeModalProps {
  tableId: string;
  onClose: () => void;
}

export function PrintQRCodeModal({ tableId, onClose }: PrintQRCodeModalProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/qr/table/${tableId}`)
      .then(res => res.json())
      .then(data => {
        if (data.qrCode) {
          setUrl(`${window.location.origin}/scan/${data.qrCode.code}`);
        }
      })
      .catch(console.error);
  }, [tableId]);

  const handlePrint = () => {
    window.print();
  };

  if (!url) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <GlassPanel premium className="p-8 flex items-center justify-center">
          <p>Loading QR Code...</p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:bg-white print:p-0">
      <GlassPanel premium className="w-full max-w-sm p-8 relative flex flex-col items-center bg-white print:shadow-none print:border-none print:max-w-none">
        
        {/* Do not show close button in print view */}
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 print:hidden">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-serif mb-2 text-neutral-900">Table {tableId}</h2>
        <p className="text-neutral-500 text-sm mb-6 text-center print:hidden">
          Scan this QR code to access the digital menu and place an order.
        </p>
        
        {/* Scan instruction for the printout */}
        <p className="hidden print:block text-neutral-500 text-sm mb-6 text-center font-medium">
          Scan to Order & Pay
        </p>

        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm mb-8 print:border-none print:shadow-none print:p-0">
          <QRCode value={url} size={200} level="H" />
        </div>

        <button 
          onClick={handlePrint}
          className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 print:hidden"
        >
          <Printer size={18} />
          <span>Print QR Code</span>
        </button>
      </GlassPanel>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            background: white !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}
