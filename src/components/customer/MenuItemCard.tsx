"use client";

import { useCart } from "@/hooks/useCart";
import { useSessionStore } from "@/stores/sessionStore";
import { QuantitySelector } from "./QuantitySelector";
import { Plus } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    veg?: boolean;
    tags?: string[];
    chefSpecial?: boolean;
    mostOrdered?: boolean;
    isNewArrival?: boolean;
    limitedTimeOffer?: boolean;
  };
  restaurantId?: string;
}

export function MenuItemCard({ item, restaurantId }: MenuItemCardProps) {
  const { sessionId } = useSessionStore();
  const { data: cartData, addToCart, updateQuantity, removeFromCart, isAdding } = useCart(sessionId);
  const toast = useToast();

  const cartItem = cartData?.cart?.find((ci: any) => ci.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!sessionId) {
      toast.error("View Only Mode: Please scan the QR code at your table to place an order.");
      return;
    }
    try {
      if (item.id && restaurantId) {
        // Analytics
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId,
            sessionId,
            eventType: "add_to_cart",
            itemId: item.id,
          })
        }).catch(() => {});
      }

      await addToCart({
        sessionId,
        menuItemId: item.id,
        quantity: 1,
      });
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error("Your session has ended or is invalid. Please scan the QR code again.");
        // Optional: clear session
        useSessionStore.getState().clearSession();
      } else {
        toast.error("Failed to add item to cart.");
      }
    }
  };

  const handleIncrease = () => {
    if (!sessionId || !cartItem) return;
    updateQuantity({
      sessionId,
      cartItemId: cartItem._id,
      quantity: quantity + 1,
    });
  };

  const handleDecrease = async () => {
    if (!sessionId || !cartItem) return;
    try {
      if (quantity === 1) {
        await removeFromCart({ sessionId, cartItemId: cartItem._id });
      } else {
        updateQuantity({
          sessionId,
          cartItemId: cartItem._id,
          quantity: quantity - 1,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update cart.");
    }
  };

  return (
    <div className="flex bg-white dark:bg-zinc-900 rounded-2xl p-4 mb-4 shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* Content */}
      <div className="flex-1 pr-4">
        {/* Badges & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {item.veg !== undefined && (
            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${item.veg ? "border-green-600" : "border-red-600"}`}>
              <div className={`w-2 h-2 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
          )}
          
          {item.chefSpecial && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 rounded-full">
              Chef Special
            </span>
          )}
          {item.isNewArrival && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full">
              New
            </span>
          )}
          {item.limitedTimeOffer && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-full">
              LTO
            </span>
          )}

          {item.tags?.slice(0, 1).map((tag, i) => (
            <span key={i} className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight mb-1">{item.name}</h3>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-300 mb-2">₹{item.price.toFixed(2)}</p>
        
        {item.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
      </div>

      {/* Image & Controls */}
      <div className="flex flex-col items-center justify-between w-[100px]">
        {item.image ? (
          <div className="w-24 h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative mb-[-16px]">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-[-16px]">
            <span className="text-zinc-300 dark:text-zinc-600 text-[10px] text-center px-2 font-medium uppercase tracking-wider">{item.name}</span>
          </div>
        )}

        <div className="relative z-10 w-full flex justify-center">
          {quantity > 0 ? (
            <QuantitySelector
              quantity={quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
            />
          ) : (
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-sm px-6 py-2 rounded-full shadow-lg shadow-black/10 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <span>Add</span>
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
