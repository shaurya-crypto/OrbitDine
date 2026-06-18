import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import Image from "next/image";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MapPin, Clock, Star, Phone, Globe, ExternalLink, Heart, Navigation, Share2 } from "lucide-react";

async function getRestaurantBySlug(slug: string) {
  await connectToDatabase();
  const restaurant = await Restaurant.findOne({ slug }).lean();
  
  if (!restaurant) {
    // Check slug history for redirects
    const redirectMatch = await Restaurant.findOne({ slugHistory: slug }).lean();
    if (redirectMatch) {
      return { redirect: `/restaurant/${redirectMatch.slug}` };
    }
    return null;
  }
  
  return { restaurant };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getRestaurantBySlug(params.slug);
  
  if (!data || data.redirect || !data.restaurant) {
    return {
      title: "Restaurant Not Found | OrbitDine",
      description: "The requested restaurant could not be found.",
    };
  }

  const restaurant = data.restaurant as any;
  const title = restaurant.seoMetadata?.title || `${restaurant.name} | OrbitDine`;
  const description = restaurant.seoMetadata?.description || restaurant.description || `Order from ${restaurant.name} on OrbitDine.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/restaurant/${restaurant.slug}`;
  const imageUrl = restaurant.bannerImage || restaurant.logo || `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "OrbitDine",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function RestaurantProfilePage({ params }: { params: { slug: string } }) {
  const data = await getRestaurantBySlug(params.slug);
  
  if (!data) notFound();
  if (data.redirect) redirect(data.redirect);

  const restaurant = data.restaurant as any;

  // Generate structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "image": restaurant.bannerImage || restaurant.logo,
    "description": restaurant.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address,
      "addressLocality": restaurant.city,
      "addressRegion": restaurant.state,
      "postalCode": restaurant.pinCode,
      "addressCountry": restaurant.country
    },
    "telephone": restaurant.phone,
    "url": restaurant.socialLinks?.website || `${process.env.NEXT_PUBLIC_APP_URL}/restaurant/${restaurant.slug}`,
    "aggregateRating": restaurant.reviewCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": restaurant.rating,
      "reviewCount": restaurant.reviewCount
    } : undefined
  };

  const getGoogleMapsLink = () => {
    if (restaurant.location?.coordinates) {
      const [lng, lat] = restaurant.location.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address + ' ' + restaurant.city)}`;
  };

  return (
    <div className="min-h-screen bg-base pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 w-full bg-surface-dark">
        {restaurant.bannerImage ? (
          <Image
            src={restaurant.bannerImage}
            alt={`${restaurant.name} Banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Info */}
          <div className="flex-1">
            <GlassPanel className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface shadow-xl flex-shrink-0 border-4 border-base">
                  {restaurant.logo ? (
                    <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-accent bg-accent/10">
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-text-primary tracking-tight mb-2">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {restaurant.rating > 0 && (
                      <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-md font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
                      </span>
                    )}
                    <span className="text-text-secondary">{restaurant.cuisineType || "Multi-Cuisine"}</span>
                    <span className="text-text-secondary">•</span>
                    <span className="text-text-secondary">
                      {Array(restaurant.averagePrice).fill("₹").join("")}
                    </span>
                  </div>
                </div>
              </div>

              {restaurant.description && (
                <p className="text-text-secondary leading-relaxed">
                  {restaurant.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                {restaurant.address && (
                  <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-text-secondary hover:text-accent transition-colors group">
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent/70 group-hover:text-accent" />
                    <span>{restaurant.address}, {restaurant.city} <ExternalLink className="w-3 h-3 inline ml-1" /></span>
                  </a>
                )}
                {restaurant.openingHours && (
                  <div className="flex items-start gap-3 text-sm text-text-secondary">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent/70" />
                    <span>{restaurant.openingHours} - {restaurant.closingHours}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors">
                    <Phone className="w-5 h-5 flex-shrink-0 text-accent/70" />
                    <span>{restaurant.phone}</span>
                  </a>
                )}
              </div>
              
              <div className="pt-4 flex gap-4">
                 <a href={`/restaurant/${restaurant.slug}/menu`} className="flex-1 bg-accent text-white py-3 rounded-xl font-medium text-center hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
                   View Full Menu
                 </a>
                 <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="flex-1 bg-surface border border-border text-text-primary py-3 rounded-xl font-medium text-center flex items-center justify-center gap-2 hover:bg-base transition-colors">
                   <Navigation className="w-4 h-4" /> Get Directions
                 </a>
              </div>
            </GlassPanel>

            {/* Empty States for Future Sections */}
            <div className="mt-8">
              <h2 className="text-2xl font-serif text-text-primary mb-6">Featured Dishes</h2>
              {restaurant.featuredItems && restaurant.featuredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Items will be populated here via client components or populated queries */}
                  <p className="text-text-secondary">Loading featured items...</p>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-text-secondary bg-surface/50">
                  No featured dishes available.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Sidebar Info */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-6">
            <GlassPanel className="p-6">
               <h3 className="font-medium text-text-primary mb-4">Location</h3>
               {/* Map Placeholder */}
               <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="block relative w-full h-40 bg-base rounded-xl overflow-hidden border border-border group">
                 <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors flex items-center justify-center">
                   <Navigation className="w-8 h-8 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                 </div>
               </a>
            </GlassPanel>

            {(restaurant.socialLinks?.facebook || restaurant.socialLinks?.instagram || restaurant.socialLinks?.website) && (
              <GlassPanel className="p-6">
                <h3 className="font-medium text-text-primary mb-4">Connect</h3>
                <div className="space-y-3">
                  {restaurant.socialLinks.website && (
                    <a href={restaurant.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              </GlassPanel>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
