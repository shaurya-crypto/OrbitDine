import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = req.cookies.get("accessToken")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      restaurantId, name, slug, description, bannerImage, logo, gallery, socialLinks, 
      workingHours, cuisineType, featuredItems, bestSellers, chefRecommendations, 
      todaySpecials, trendingItems, promotionBanner, promotionText, seoMetadata,
      address, city, state, pinCode, country, latitude, longitude
    } = body;

    let restaurant;
    if (decoded.roles.includes("superadmin") || decoded.roles.includes("manager")) {
      if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findOne({ ownerId: decoded.userId });
    }

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Role check
    if (!decoded.roles.includes("owner") && !decoded.roles.includes("manager") && !decoded.roles.includes("superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Slug collision & history handling
    if (slug && slug !== restaurant.slug) {
      const existingSlug = await Restaurant.findOne({ slug });
      if (existingSlug && existingSlug._id.toString() !== restaurant._id.toString()) {
        return NextResponse.json({ error: "Slug is already taken by another restaurant." }, { status: 400 });
      }
      
      // Add old slug to history to support redirects
      if (!restaurant.slugHistory.includes(restaurant.slug)) {
        restaurant.slugHistory.push(restaurant.slug);
      }
      restaurant.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Update fields
    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (bannerImage !== undefined) restaurant.bannerImage = bannerImage;
    if (logo !== undefined) restaurant.logo = logo;
    if (gallery !== undefined) restaurant.gallery = gallery;
    if (socialLinks !== undefined) restaurant.socialLinks = socialLinks;
    if (cuisineType !== undefined) restaurant.cuisineType = cuisineType;
    if (promotionBanner !== undefined) restaurant.promotionBanner = promotionBanner;
    if (promotionText !== undefined) restaurant.promotionText = promotionText;
    if (seoMetadata !== undefined) restaurant.seoMetadata = seoMetadata;

    // Address & Location
    if (address) restaurant.address = address;
    if (city) restaurant.city = city;
    if (state) restaurant.state = state;
    if (pinCode) restaurant.pinCode = pinCode;
    if (country) restaurant.country = country;
    
    if (latitude && longitude) {
      restaurant.latitude = latitude;
      restaurant.longitude = longitude;
      restaurant.location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };
    }

    // Growth references
    if (featuredItems) restaurant.featuredItems = featuredItems;
    if (bestSellers) restaurant.bestSellers = bestSellers;
    if (chefRecommendations) restaurant.chefRecommendations = chefRecommendations;
    if (todaySpecials) restaurant.todaySpecials = todaySpecials;
    if (trendingItems) restaurant.trendingItems = trendingItems;

    await restaurant.save();

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
