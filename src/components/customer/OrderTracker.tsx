"use client";

import { motion } from "framer-motion";
import { Check, ChefHat, PackageCheck, Utensils, BellRing } from "lucide-react";
import { useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { useToast } from "@/components/ui/ToastProvider";

interface OrderTrackerProps {
  status: "received" | "preparing" | "ready" | "served" | "cancelled";
  orderNumber: string;
}

export function OrderTracker({ status, orderNumber }: OrderTrackerProps) {
  const steps = [
    { id: "received", label: "Order Received", icon: <Check size={20} /> },
    { id: "preparing", label: "Preparing", icon: <ChefHat size={20} /> },
    { id: "ready", label: "Ready to Serve", icon: <PackageCheck size={20} /> },
    { id: "served", label: "Served", icon: <Utensils size={20} /> },
  ];

  const { sessionId } = useSessionStore();
  const [isReminding, setIsReminding] = useState(false);
  const toast = useToast();

  const handleRemind = async (type: 'food' | 'serve') => {
    setIsReminding(true);
    try {
      await fetch("/api/sessions/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, type })
      });
      toast.success(type === 'food' ? "Kitchen notified!" : "Staff notified!");
    } catch (e) {
      toast.error("Failed to send reminder");
    } finally {
      setIsReminding(false);
    }
  };

  const currentIndex = steps.findIndex((s) => s.id === status);

  if (status === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <h3 className="text-red-600 font-semibold mb-2">Order {orderNumber} Cancelled</h3>
        <p className="text-sm text-red-500">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
        <h3 className="font-semibold text-neutral-900">Order {orderNumber}</h3>
        <span className="text-xs font-bold bg-neutral-100 px-3 py-1 rounded-full uppercase tracking-widest text-neutral-600">
          {status}
        </span>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-neutral-100 -z-10" />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.id} className="flex items-center space-x-4">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? "#171717" : "#FFFFFF",
                    borderColor: isCompleted ? "#171717" : "#E5E5E5",
                    color: isCompleted ? "#FFFFFF" : "#A3A3A3",
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white z-10"
                >
                  {step.icon}
                </motion.div>
                <div>
                  <p className={`font-medium ${isCompleted ? "text-neutral-900" : "text-neutral-400"}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-neutral-500 mt-1"
                    >
                      {step.id === "received" && "Waiting for kitchen to accept..."}
                      {step.id === "preparing" && "Chef is working their magic."}
                      {step.id === "ready" && "Food is plated! Coming to you soon."}
                      {step.id === "served" && "Enjoy your meal!"}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder Buttons */}
      {(status === "preparing" || status === "ready") && (
        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={() => handleRemind(status === "preparing" ? 'food' : 'serve')}
            disabled={isReminding}
            className="flex items-center gap-2 text-sm font-medium bg-accent-soft text-accent px-4 py-2 rounded-full hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
          >
            <BellRing size={16} />
            {isReminding ? "Sending..." : (status === "preparing" ? "Remind about Food" : "Remind to Serve")}
          </button>
        </div>
      )}
    </div>
  );
}
