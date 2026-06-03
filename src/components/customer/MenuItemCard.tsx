"use client";

import { useCart } from "@/hooks/useCart";
import { useSessionStore } from "@/stores/sessionStore";
import { QuantitySelector } from "./QuantitySelector";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    veg?: boolean;
    tags?: string[];
  };
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { sessionId } = useSessionStore();
  const { data: cartData, addToCart, updateQuantity, removeFromCart, isAdding } = useCart(sessionId);

  const cartItem = cartData?.cart?.find((ci: any) => ci.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (!sessionId) return;
    await addToCart({
      sessionId,
      menuItemId: item.id,
      quantity: 1,
    });
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
    if (quantity === 1) {
      await removeFromCart({ sessionId, cartItemId: cartItem._id });
    } else {
      updateQuantity({
        sessionId,
        cartItemId: cartItem._id,
        quantity: quantity - 1,
      });
    }
  };

  return (
    <div className="flex bg-white rounded-2xl p-4 mb-4 shadow-sm border border-neutral-100">
      {/* Content */}
      <div className="flex-1 pr-4">
        {/* Veg/Non-Veg Tag */}
        <div className="flex items-center space-x-2 mb-1">
          <div
            className={`w-4 h-4 border flex items-center justify-center rounded-sm ${
              item.veg ? "border-green-600" : "border-red-600"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
          </div>
          {item.tags?.slice(0, 1).map((tag, i) => (
            <span key={i} className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-semibold text-neutral-900 leading-tight mb-1">{item.name}</h3>
        <p className="text-sm font-medium text-neutral-900 mb-2">${item.price.toFixed(2)}</p>
        
        {item.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
      </div>

      {/* Image & Controls */}
      <div className="flex flex-col items-center justify-between w-[100px]">
        {item.image ? (
          <div className="w-24 h-24 rounded-xl bg-neutral-100 overflow-hidden relative mb-[-16px]">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-[-16px]">
            <span className="text-neutral-300 text-xs text-center px-2">{item.name}</span>
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
              className="bg-neutral-900 text-white font-medium text-sm px-6 py-2 rounded-full shadow-lg shadow-black/10 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-1"
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
