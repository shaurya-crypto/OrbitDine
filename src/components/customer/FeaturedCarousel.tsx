import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { MenuItemCard } from "./MenuItemCard"; // Assuming we want a mini version or we can just use a custom card

interface CarouselProps {
  title: string;
  items: any[];
  badgeColor?: string;
  badgeText?: string;
  onAddToCart: (item: any) => void;
}

export function FeaturedCarousel({ title, items, badgeColor = "bg-accent", badgeText, onAddToCart }: CarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center px-4 md:px-6 mb-4">
        <h2 className="text-lg md:text-2xl font-serif font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          {title}
        </h2>
        <button className="text-accent text-sm md:text-base font-medium flex items-center hover:opacity-80 transition-opacity">
          See All <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-6 pb-4 snap-x snap-mandatory hide-scrollbar">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="min-w-[240px] max-w-[240px] snap-start bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col"
          >
            {/* Image */}
            <div className="relative h-32 w-full bg-zinc-100 dark:bg-zinc-800">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-serif opacity-30">
                  OrbitDine
                </div>
              )}
              {badgeText && (
                <div className={`absolute top-2 left-2 ${badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider`}>
                  {badgeText}
                </div>
              )}
              {item.veg !== undefined && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded shadow-sm">
                  <div className={`w-3 h-3 border-2 ${item.veg ? "border-green-600" : "border-red-600"} flex items-center justify-center`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{item.name}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2 min-h-[32px]">{item.description}</p>
              
              <div className="mt-auto pt-3 flex justify-between items-center">
                <span className="font-bold text-zinc-900 dark:text-white">₹{item.price}</span>
                <button 
                  onClick={() => onAddToCart(item)}
                  className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold px-4 py-1.5 rounded-lg hover:scale-105 transition-transform"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
