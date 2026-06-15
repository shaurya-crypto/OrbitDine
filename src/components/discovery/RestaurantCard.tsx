import Image from "next/image";
import { Star, MapPin, Tag, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

interface RestaurantCardProps {
  restaurant: any;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { userId } = useAuthStore();
  const router = useRouter();
  const bgImage = restaurant.bannerImage || restaurant.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80";

  const handleCardClick = () => {
    if (!!userId) {
      router.push(`/menu/${restaurant._id}`);
    } else {
      router.push(`/login`);
    }
  };

  return (
    <div onClick={handleCardClick} className="block group cursor-pointer">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col hover:border-accent/50">
        
        {/* Banner */}
        <div className="relative w-full h-48 bg-zinc-950 overflow-hidden">
          <Image 
            src={bgImage}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {restaurant.isOpen ? (
              <span className="bg-green-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-sm">
                Open Now
              </span>
            ) : (
              <span className="bg-zinc-800 text-zinc-300 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-sm">
                Closed
              </span>
            )}
          </div>
          
          {/* Bottom Banner Content */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <h3 className="text-xl font-serif text-white tracking-tight drop-shadow-md truncate pr-2">
              {restaurant.name}
            </h3>
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 text-white font-medium text-sm">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary mb-3">
            {restaurant.cuisineType && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-accent" />
                {restaurant.cuisineType}
              </span>
            )}
            
            {restaurant.distanceKm !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                {restaurant.distanceKm < 1 
                  ? `${(restaurant.distanceKm * 1000).toFixed(0)}m away` 
                  : `${restaurant.distanceKm.toFixed(1)}km away`}
              </span>
            )}
          </div>
          
          {restaurant.description ? (
            <p className="text-sm text-text-secondary line-clamp-2 mt-auto">
              {restaurant.description}
            </p>
          ) : (
            <div className="mt-auto"></div>
          )}

          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {restaurant.openingHours && restaurant.closingHours 
                ? `${restaurant.openingHours} - ${restaurant.closingHours}`
                : "Hours not set"}
            </span>
            <span className="bg-base px-2 py-1 rounded border border-border">
              {Array.from({ length: restaurant.averagePrice || 2 }).map(() => "$").join("")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
