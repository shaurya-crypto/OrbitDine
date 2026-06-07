"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useSessionStore } from "@/stores/sessionStore";
import { OrderTracker } from "@/components/customer/OrderTracker";
import { requestBill } from "@/services/orderService";
import { Receipt, ArrowLeft, Plus } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/ToastProvider";
import { FeedbackCard } from "@/components/customer/FeedbackCard";

export default function OrdersPage() {
  const router = useRouter();
  const { sessionId: paramSessionId } = useParams();
  const { sessionId, restaurantId } = useSessionStore();
  const { data, isLoading } = useOrderTracking(sessionId);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const toast = useToast();

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
        toast.error("Failed to request bill");
        setIsRequestingBill(false);
      }
    }
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;

  const activeOrders = data || [];
  const hasServedOrder = activeOrders.some((order: any) => order.status === "served");

  return (
    <main className="min-h-screen bg-base flex flex-col max-w-md mx-auto relative pb-32">
      {/* Header */}
      <div className="bg-surface px-4 py-4 sticky top-0 z-40 border-b border-border flex items-center shadow-sm">
        <button onClick={() => router.push(`/menu/${restaurantId}`)} className="w-10 h-10 flex items-center justify-center rounded-full bg-base text-text-primary hover:bg-border/50 active:scale-95 transition-all mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-serif text-text-primary tracking-tight">Live Orders</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {hasServedOrder && !hasRated && !dismissBanner && (
          <div className="bg-accent-soft border border-accent/20 rounded-2xl p-5 mb-4 animate-fade-in shadow-lg">
            <h3 className="text-lg font-serif text-text-primary mb-1">How was your experience today?</h3>
            <p className="text-sm text-text-secondary mb-4">Your food has been served. Let us know how we did!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRatingModal(true)} className="flex-1 bg-accent text-white py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                Rate Now
              </button>
              <button onClick={() => setDismissBanner(true)} className="flex-1 bg-surface border border-border text-text-secondary py-2.5 rounded-xl font-medium text-sm hover:text-text-primary transition-colors">
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {activeOrders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-text-secondary mb-4">No active orders yet.</h2>
            <button 
              onClick={() => router.push(`/menu/${restaurantId}`)}
              className="bg-text-primary text-base px-6 py-2 rounded-full font-medium"
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-base via-base to-transparent pt-12 pb-safe z-30">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/menu/${restaurantId}`)}
            className="bg-surface border-2 border-border text-text-primary font-medium py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            <span>Order More</span>
          </button>
          <button
            onClick={handleRequestBill}
            disabled={isRequestingBill || activeOrders.length === 0}
            className="bg-text-primary text-base font-medium py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50 shadow-lg"
          >
            <Receipt size={18} />
            <span>{isRequestingBill ? "Requesting..." : "Pay Bill"}</span>
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm relative">
            <button onClick={() => setShowRatingModal(false)} className="absolute -top-12 right-0 text-white hover:text-accent font-medium p-2">
              Close
            </button>
            <FeedbackCard 
              restaurantId={restaurantId!} 
              sessionId={sessionId!} 
              onSuccess={() => {
                setHasRated(true);
                setTimeout(() => setShowRatingModal(false), 2000);
              }} 
            />
          </div>
        </div>
      )}
    </main>
  );
}
