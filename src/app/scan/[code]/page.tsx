"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { scanQRCode } from "@/services/sessionService";
import { useSessionStore } from "@/stores/sessionStore";
import { Loader } from "@/components/ui/Loader";

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { setSession, sessionId } = useSessionStore();

  useEffect(() => {
    async function initSession() {
      if (!code) return;

      try {
        const sessionData = await scanQRCode(code);
        
        // Save to Zustand (persisted to localStorage automatically)
        setSession(sessionData._id, sessionData.restaurantId, sessionData.tableId);
        
        // Redirect to Menu
        router.push(`/menu/${sessionData.restaurantId}`);
      } catch (error) {
        console.error("Failed to initialize session:", error);
        // Fallback: If it says 'Joined existing session', the backend still returns `data` via a 200 OK.
        // Wait, the API wrapper might throw if it's a 400/404, but 200 is fine.
        // For simplicity, let's just alert for now or show error UI
        alert("Invalid QR Code or Table Unavailable");
        router.push("/");
      }
    }

    initSession();
  }, [code, router, setSession]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral-900 text-white p-6">
      <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8 shadow-inner animate-pulse">
        <Loader />
      </div>
      <h1 className="text-2xl font-serif tracking-tight mb-2">Establishing Connection</h1>
      <p className="text-neutral-400 text-sm text-center max-w-xs">
        Preparing your table's live session and synchronizing menu data...
      </p>
    </div>
  );
}
