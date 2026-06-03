"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useSessionStore } from "@/stores/sessionStore";
import { OrderTracker } from "@/components/customer/OrderTracker";
import { requestBill } from "@/services/orderService";
import { Receipt, ArrowLeft, Plus } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

export default function OrdersPage() {
  const router = useRouter();
  const { sessionId: paramSessionId } = useParams();
  const { sessionId, restaurantId } = useSessionStore();
  const { data, isLoading } = useOrderTracking(sessionId);
  const [isRequestingBill, setIsRequestingBill] = useState(false);

  useEffect(() => {
    // If param doesn't match session, user shouldn't be here
    if (!sessionId || sessionId !== paramSessionId) {
      router.push("/");
    }
  }, [sessionId, paramSessionId, router]);

  const handleRequestBill = async () => {
    if (!sessionId) return;
    setIsRequestingBill(true);
    try {
      await requestBill({ sessionId });
      router.push(`/bill/${sessionId}`);
    } catch (error: any) {
      // If bill is already generated or requested, just push them to the bill page anyway
      if (error?.response?.status === 400 || error?.response?.status === 200) {
        router.push(`/bill/${sessionId}`);
      } else {
        alert("Failed to request bill");
        setIsRequestingBill(false);
      }
    }
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;

  const activeOrders = data || [];

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto relative pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-neutral-100 flex items-center">
        <button onClick={() => router.push(`/menu/${restaurantId}`)} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-900 active:scale-95 transition-transform mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Live Orders</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {activeOrders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-neutral-500 mb-4">No active orders yet.</h2>
            <button 
              onClick={() => router.push(`/menu/${restaurantId}`)}
              className="bg-neutral-900 text-white px-6 py-2 rounded-full font-medium"
            >
              Order Something
            </button>
          </div>
        ) : (
          activeOrders.map((order: any) => (
            <OrderTracker key={order._id} status={order.status} orderNumber={order.orderNumber} />
          ))
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12 pb-safe z-50">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/menu/${restaurantId}`)}
            className="bg-white border-2 border-neutral-200 text-neutral-900 font-medium py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            <span>Order More</span>
          </button>
          <button
            onClick={handleRequestBill}
            disabled={isRequestingBill || activeOrders.length === 0}
            className="bg-neutral-900 text-white font-medium py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50 shadow-lg shadow-black/10"
          >
            <Receipt size={18} />
            <span>{isRequestingBill ? "Requesting..." : "Pay Bill"}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
