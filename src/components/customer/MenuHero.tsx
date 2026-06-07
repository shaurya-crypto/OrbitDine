import { Star, MapPin, Tag, Clock, Phone } from "lucide-react";
import Image from "next/image";

interface MenuHeroProps {
  restaurant: any;
  tableNumber: string;
}

export function MenuHero({ restaurant, tableNumber }: MenuHeroProps) {
  const bgImage = restaurant.bannerImage || restaurant.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80";

  return (
    <div className="w-full bg-zinc-950">
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden md:rounded-b-[2.5rem] shadow-2xl">
        {/* Banner Image */}
        <div className="w-full h-56 md:h-96 lg:h-[450px] relative">
          <Image 
            src={bgImage} 
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        {/* Content over Banner */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 pb-6 md:pb-12 z-10">
          <div className="flex justify-between items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight drop-shadow-lg mb-2 md:mb-4">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm md:text-base text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
                  <span className="text-zinc-400 text-xs ml-0.5">({restaurant.reviewCount || 0})</span>
                </span>
                
                {restaurant.cuisineType && (
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Tag className="w-4 h-4" />
                    {restaurant.cuisineType}
                  </span>
                )}
              </div>
              
              {restaurant.description && (
                <p className="text-zinc-300 text-sm md:text-base mt-4 max-w-2xl line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-sm">
                  {restaurant.description}
                </p>
              )}

              {/* Contact & Location Details */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm text-zinc-300">
                {(restaurant.openingHours && restaurant.closingHours) && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {restaurant.openingHours} - {restaurant.closingHours}
                  </span>
                )}
                {restaurant.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {restaurant.phone}
                  </span>
                )}
                {restaurant.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{restaurant.address}</span>
                  </span>
                )}
                {restaurant.location?.coordinates && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-1 rounded-md transition-colors text-white font-medium ml-auto sm:ml-0"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            {tableNumber !== "N/A" && (
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl md:rounded-3xl w-16 h-16 md:w-24 md:h-24 shadow-2xl flex-shrink-0">
                <span className="text-[10px] md:text-xs font-mono text-zinc-400 uppercase tracking-widest mb-0.5">Table</span>
                <span className="text-2xl md:text-4xl font-bold text-white leading-none">{tableNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
