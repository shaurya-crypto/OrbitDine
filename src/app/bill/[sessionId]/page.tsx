"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { generateBill } from "@/services/billService";
import { Loader } from "@/components/ui/Loader";
import { Receipt, CheckCircle2, Star, Send, BellRing } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/ToastProvider";
import { FeedbackCard } from "@/components/customer/FeedbackCard";

export default function BillPage() {
  const router = useRouter();
  const { sessionId: paramSessionId } = useParams();
  const { sessionId, clearSession, _hasHydrated } = useSessionStore();
  const [bill, setBill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [isBillRequested, setIsBillRequested] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (_hasHydrated && (!sessionId || sessionId !== paramSessionId)) {
      router.push("/");
      return;
    }
    
    if (!_hasHydrated) return;

    async function fetchBill() {
      try {
        const response = await generateBill({ sessionId: sessionId! });
        setBill(response);
        if (response.status === "requested" || response.status === "paid") {
          setIsBillRequested(true);
        }
      } catch (error) {
        console.error("Failed to load bill", error);
        toast.error("Could not load your bill. Please ask a staff member for assistance.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBill();
  }, [sessionId, paramSessionId, _hasHydrated, router, toast]);

  const handleRequestBillClick = async () => {
    setIsRequestingBill(true);
    try {
      await axios.post("/api/orders/request-bill", { sessionId });
      setIsBillRequested(true);
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 200) {
        setIsBillRequested(true); // Already requested
      } else {
        console.error("Failed to process request", error);
        toast.error(error?.response?.data?.message || "Failed to process your request");
      }
    } finally {
      setIsRequestingBill(false);
    }
  };

  const handleRemindBill = async () => {
    setIsReminding(true);
    try {
      await axios.post("/api/sessions/remind", { sessionId, type: "bill" });
      toast.success("Staff notified!");
    } catch (error) {
      toast.error("Failed to send reminder");
    } finally {
      setIsReminding(false);
    }
  };

  const [showSignup, setShowSignup] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", email: "", password: "" });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader type="spinner" className="w-10 h-10 border-t-accent" /></div>;
  if (!bill) return <div className="p-6 text-center text-red-500">Bill not found.</div>;

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Signup
      await axios.post("/api/auth/signup", {
        fullName: customerForm.name,
        email: customerForm.email,
        password: customerForm.password,
        role: "customer"
      });

      // 2. Login
      await axios.post("/api/auth/login", {
        email: customerForm.email,
        password: customerForm.password
      });

      // 3. Migrate Session
      await axios.post("/api/customer/migrate-session", {
        sessionId
      });

      setIsLoading(false);
      setSignupSuccess(true);
      setShowSignup(false);

      // Redirect to Dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/customer");
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
      toast.error(error.response?.data?.error || "Failed to create account");
    }
  };

  if (isBillRequested) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center bg-base text-text-primary p-6 pt-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center mb-8">
          <CheckCircle2 size={80} className="text-accent mb-6" />
          <h1 className="text-3xl font-serif tracking-tight mb-2">Bill Requested</h1>
          <p className="text-text-secondary text-center max-w-xs mb-6">
            Staff is bringing your bill to the table. Thank you for dining with us!
          </p>
          <button
            onClick={handleRemindBill}
            disabled={isReminding}
            className="flex items-center gap-2 text-sm font-medium bg-accent-soft text-accent px-5 py-2.5 rounded-full hover:bg-accent hover:text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <BellRing size={16} />
            {isReminding ? "Sending..." : "Remind Staff"}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          {!hasRated && (
            <FeedbackCard 
              restaurantId={bill.restaurantId} 
              sessionId={sessionId!} 
              onSuccess={() => setHasRated(true)} 
            />
          )}

          {signupSuccess ? (
            <div className="bg-surface border border-border p-6 rounded-3xl text-center">
              <h3 className="text-xl font-medium text-text-primary mb-2">Account Created!</h3>
              <p className="text-sm text-text-secondary">Your dining history has been saved.</p>
              <div className="mt-4 flex justify-center">
                <Loader type="spinner" className="w-5 h-5 border-t-accent" />
              </div>
            </div>
          ) : !showSignup ? (
            <div className="bg-surface border border-border p-8 rounded-[2rem] text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-accent-soft to-transparent z-0" />
              <div className="relative z-10">
                <h3 className="text-xl font-serif text-text-primary mb-4">While you wait, Save Your Experience</h3>
                <ul className="text-sm text-text-secondary space-y-3 mb-8 text-left max-w-[200px] mx-auto">
                  <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-accent mr-3"/> Order History</li>
                  <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-accent mr-3"/> Favorites</li>
                  <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-border mr-3"/> Loyalty Features</li>
                </ul>
                <button 
                  onClick={() => setShowSignup(true)}
                  className="w-full bg-text-primary text-base font-medium px-6 py-4 rounded-xl hover:opacity-90 transition-opacity mb-4"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomerSignup} className="bg-surface border border-border p-6 rounded-[2rem] space-y-4">
              <h3 className="text-xl font-medium text-text-primary mb-4 text-center">Create Account</h3>
              <div>
                <input required type="text" placeholder="Name" className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
              </div>
              <div>
                <input required type="email" placeholder="Email" className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
              </div>
              <div>
                <input required type="password" placeholder="Password" className="w-full bg-base border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent" value={customerForm.password} onChange={e => setCustomerForm({...customerForm, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-accent text-white font-medium px-6 py-4 rounded-xl hover:opacity-90 transition-opacity mt-2">
                Save Account
              </button>
              <button type="button" onClick={() => setShowSignup(false)} className="w-full text-text-secondary text-sm py-2 hover:text-text-primary transition-colors">
                Cancel
              </button>
            </form>
          )}

          <button 
            onClick={() => router.push("/")}
            className="w-full text-text-secondary font-medium px-8 py-4 rounded-xl mt-6 hover:text-text-primary transition-colors"
          >
            Return Home
          </button>
        </div>
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
                <span className="text-neutral-900">₹{item.itemTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 border-dashed pt-4 space-y-3">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-900">₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Tax</span>
              <span className="font-medium text-neutral-900">₹{bill.tax.toFixed(2)}</span>
            </div>
            {bill.serviceCharge > 0 && (
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Service Charge</span>
                <span className="font-medium text-neutral-900">₹{bill.serviceCharge.toFixed(2)}</span>
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
            <span className="font-serif text-3xl tracking-tight text-neutral-900">₹{bill.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent pt-12 pb-safe z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleRequestBillClick}
            disabled={isRequestingBill || bill.status === "paid"}
            className="w-full bg-neutral-900 text-white font-medium text-lg py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform disabled:opacity-70 shadow-xl shadow-black/20"
          >
            <span>{isRequestingBill ? "Processing..." : "Request Bill"}</span>
          </button>
        </div>
      </div>

    </main>
  );
}
