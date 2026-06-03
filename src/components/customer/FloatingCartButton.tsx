"use client";

import { useCart } from "@/hooks/useCart";
import { useSessionStore } from "@/stores/sessionStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCartButton() {
  const { sessionId } = useSessionStore();
  const { data: cartData } = useCart(sessionId);

  const itemCount = cartData?.cart?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link href="/cart">
              <div className="bg-neutral-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-black/20 active:scale-95 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ShoppingBag size={24} />
                    <span className="absolute -top-2 -right-2 bg-white text-neutral-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                  </div>
                  <span className="font-medium text-sm">View Cart</span>
                </div>
                <div className="font-semibold tracking-wide">
                  ₹{cartData?.grandTotal?.toFixed(2)}
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
