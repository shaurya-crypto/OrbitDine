"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { sessionId } = useSessionStore();

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
    }
  }, [sessionId, router]);

  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-green-500 text-white p-6 relative overflow-hidden">
      
      {/* Animated Background Rings */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2, opacity: 0.2 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[500px] h-[500px] rounded-full border-[40px] border-white/20 pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="z-10 mb-8"
      >
        <CheckCircle2 size={120} strokeWidth={1.5} className="text-white drop-shadow-lg" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-serif tracking-tight mb-3 text-center z-10"
      >
        Order Received
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-green-100 text-center max-w-xs mb-12 z-10 font-medium"
      >
        The kitchen has received your order and will begin preparing it shortly.
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push(`/orders/${sessionId}`)}
        className="z-10 bg-white text-green-600 font-semibold px-8 py-4 rounded-full flex items-center space-x-2 shadow-2xl active:scale-95 transition-transform"
      >
        <span>Track Live Status</span>
        <ChevronRight size={18} strokeWidth={3} />
      </motion.button>
    </main>
  );
}
