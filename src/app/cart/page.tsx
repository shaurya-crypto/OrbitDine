"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useSessionStore } from "@/stores/sessionStore";
import { QuantitySelector } from "@/components/customer/QuantitySelector";
import { createOrder } from "@/services/orderService";
import { ArrowLeft, Trash2, ArrowRight } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";

export default function CartPage() {
  const router = useRouter();
  const { sessionId, restaurantId, _hasHydrated } = useSessionStore();
  const { data: cartData, isLoading, updateQuantity, removeFromCart, clearCart } = useCart(sessionId);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (_hasHydrated && !sessionId) {
      router.push("/");
    }
  }, [sessionId, _hasHydrated, router]);

  if (!cartData || !cartData.cart) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;
  if (isLoading || !_hasHydrated) return <div className="h-screen w-full flex items-center justify-center bg-neutral-50"><Loader /></div>;

  const cartItems = cartData?.cart || [];
  const isEmpty = cartItems.length === 0;

  const handlePlaceOrder = async () => {
    if (!sessionId || isEmpty) return;
    setIsPlacingOrder(true);
    try {
      const response = await createOrder({ sessionId });
      router.push(`/order-success/${response._id}`);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Something went wrong while placing your order.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-neutral-100 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-900 active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Your Order</h1>
        <button 
          onClick={async () => { 
            if(!isEmpty) { 
              const ok = await confirm({ title: "Clear Cart", message: "Are you sure you want to empty your cart?", isDanger: true });
              if (ok) clearCart({ sessionId: sessionId! });
            } 
          }}
          disabled={isEmpty}
          className="w-10 h-10 flex items-center justify-center text-red-500 disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🍽️</span>
          </div>
          <h2 className="text-xl font-medium text-neutral-900 mb-2">Cart is empty</h2>
          <p className="text-neutral-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => router.push(`/menu/${restaurantId}`)}
            className="bg-neutral-900 text-white font-medium px-8 py-3 rounded-full active:scale-95 transition-transform"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.map((item: any) => (
              <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-neutral-900 leading-tight mb-1">{item.name}</h3>
                  <p className="text-sm font-medium text-neutral-500 mb-2">₹{item.price.toFixed(2)}</p>
                  {item.addons?.map((addon: any, idx: number) => (
                    <p key={idx} className="text-xs text-neutral-400">+ {addon.name} (${addon.price})</p>
                  ))}
                  <p className="text-sm font-bold text-neutral-900 mt-2">₹{item.itemTotal.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch">
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity({ sessionId: sessionId!, cartItemId: item._id, quantity: item.quantity + 1 })}
                    onDecrease={() => {
                      if (item.quantity === 1) {
                        removeFromCart({ sessionId: sessionId!, cartItemId: item._id });
                      } else {
                        updateQuantity({ sessionId: sessionId!, cartItemId: item._id, quantity: item.quantity - 1 });
                      }
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Bill Summary */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 mt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 mb-4">Bill Summary</h3>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900">₹{cartData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Tax</span>
                <span className="font-medium text-neutral-900">₹{cartData.tax.toFixed(2)}</span>
              </div>
              {cartData.serviceCharge > 0 && (
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Service Charge</span>
                  <span className="font-medium text-neutral-900">₹{cartData.serviceCharge.toFixed(2)}</span>
                </div>
              )}
              {cartData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-${cartData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center mt-2">
                <span className="font-bold text-neutral-900">Grand Total</span>
                <span className="font-bold text-lg text-neutral-900">₹{cartData.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {/* iOS Bottom SafeArea Padding spacer */}
            <div className="h-24"></div>
          </div>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 pb-safe z-50">
            <div className="max-w-md mx-auto">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-neutral-900 text-white font-medium text-lg px-6 py-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform disabled:opacity-70 shadow-lg shadow-black/10"
              >
                <span>{isPlacingOrder ? "Sending to Kitchen..." : "Place Order"}</span>
                {!isPlacingOrder && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">₹{cartData.grandTotal.toFixed(2)}</span>
                    <ArrowRight size={20} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
