"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { generateBill } from "@/services/billService";
import { paymentService } from "@/services/paymentService";
import { Loader } from "@/components/ui/Loader";
import { Receipt, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function BillPage() {
  const router = useRouter();
  const { sessionId: paramSessionId } = useParams();
  const { sessionId, clearSession } = useSessionStore();
  const [bill, setBill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!sessionId || sessionId !== paramSessionId) {
      router.push("/");
      return;
    }

    async function fetchBill() {
      try {
        const response = await generateBill({ sessionId: sessionId! });
        setBill(response);
      } catch (error) {
        console.error("Failed to load bill", error);
        alert("Could not load your bill. Please ask a staff member for assistance.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBill();
  }, [sessionId, paramSessionId, router]);

  const handlePay = () => {
    if (!bill) return;
    setIsPaying(true);

    paymentService.initializePayment(
      bill.grandTotal,
      "USD",
      bill._id,
      async () => {
        // On Success
        setIsPaid(true);
        setIsPaying(false);
        // Call backend to close session
        try {
          await axios.post("/api/sessions/close", { sessionId });
          // Clear local storage session
          clearSession();
        } catch (error) {
          console.error("Failed to cleanly close session", error);
        }
      },
      (error) => {
        // On Error
        setIsPaying(false);
        alert(error.message || "Payment failed");
      }
    );
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;
  if (!bill) return <div className="p-6 text-center text-red-500">Bill not found.</div>;

  if (isPaid) {
    return (
      <main className="h-screen w-full flex flex-col items-center justify-center bg-green-50 text-green-900 p-6">
        <CheckCircle2 size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-serif tracking-tight mb-2">Payment Successful</h1>
        <p className="text-green-700/70 text-center mb-8 max-w-xs">
          Thank you for dining with us! Your session is now closed.
        </p>
        <button 
          onClick={() => router.push("/")}
          className="bg-green-600 text-white font-medium px-8 py-3 rounded-full"
        >
          Return Home
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto relative pb-32">
      <div className="bg-neutral-900 text-white px-6 py-12 text-center rounded-b-[40px] shadow-sm mb-6">
        <Receipt size={40} className="mx-auto mb-4 opacity-80" />
        <h1 className="text-3xl font-serif mb-1">Your Bill</h1>
        <p className="text-white/60 font-medium tracking-widest text-sm uppercase">{bill.billNumber}</p>
      </div>

      <div className="px-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
          <div className="space-y-4 mb-6">
            {bill.itemsSnapshot.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-neutral-900">{item.quantity}x {item.name}</span>
                  {item.addons?.map((addon: any, i: number) => (
                    <div key={i} className="text-xs text-neutral-400 pl-4">+ {addon.name}</div>
                  ))}
                </div>
                <span className="text-neutral-900">${item.itemTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 border-dashed pt-4 space-y-3">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-900">${bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Tax</span>
              <span className="font-medium text-neutral-900">${bill.tax.toFixed(2)}</span>
            </div>
            {bill.serviceCharge > 0 && (
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Service Charge</span>
                <span className="font-medium text-neutral-900">${bill.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {bill.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discounts</span>
                <span className="font-medium">-${bill.totalDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-900 pt-4 flex justify-between items-end mt-4">
            <span className="font-medium text-neutral-900">Total to Pay</span>
            <span className="font-serif text-3xl tracking-tight text-neutral-900">${bill.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent pt-12 pb-safe z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePay}
            disabled={isPaying}
            className="w-full bg-neutral-900 text-white font-medium text-lg py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform disabled:opacity-70 shadow-xl shadow-black/20"
          >
            <span>{isPaying ? "Processing..." : "Pay Now"}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
