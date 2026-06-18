import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  bannerImage?: string;
  description?: string;
  keywords?: string[];
  cuisineType?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };
  geofenceRadius?: number;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  restaurantType?: string;
  totalTables: number;
  staffCount?: number;
  openingHours?: string;
  closingHours?: string;
  rating: number;
  reviewCount: number;
  averagePrice: number;
  settings: {
    taxPercentage: number;
    serviceChargePercentage: number;
    currency: string;
    loyaltyEnabled: boolean;
    gameZoneEnabled: boolean;
  };
  plan: "free" | "pro" | "enterprise";
  status: "pending" | "active" | "suspended";
  menuVersion: number;
  slugHistory: string[];
  gallery?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  seoMetadata?: {
    title?: string;
    description?: string;
  };
  featuredItems?: mongoose.Types.ObjectId[];
  chefRecommendations?: mongoose.Types.ObjectId[];
  todaySpecials?: mongoose.Types.ObjectId[];
  bestSellers?: mongoose.Types.ObjectId[];
  trendingItems?: mongoose.Types.ObjectId[];
  promotionBanner?: string;
  promotionText?: string;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    description: {
      type: String,
    },
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      }
    ],
    cuisineType: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    geofenceRadius: {
      type: Number,
      default: 100, // Default 100 meters
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    restaurantType: {
      type: String,
    },
    totalTables: {
      type: Number,
      default: 0,
    },
    staffCount: {
      type: Number,
      default: 0,
    },
    openingHours: {
      type: String,
    },
    closingHours: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    averagePrice: {
      type: Number,
      default: 2, // 1 to 4 ($ to $$$$)
    },
    settings: {
      taxPercentage: { type: Number, default: 0 },
      serviceChargePercentage: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      loyaltyEnabled: { type: Boolean, default: false },
      gameZoneEnabled: { type: Boolean, default: false },
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    menuVersion: {
      type: Number,
      default: 1,
    },
    slugHistory: [
      {
        type: String,
        lowercase: true,
      }
    ],
    gallery: [
      {
        type: String,
      }
    ],
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      website: String,
    },
    seoMetadata: {
      title: String,
      description: String,
    },
    featuredItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      }
    ],
    chefRecommendations: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      }
    ],
    todaySpecials: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      }
    ],
    bestSellers: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      }
    ],
    trendingItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      }
    ],
    promotionBanner: String,
    promotionText: String,
    followerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

RestaurantSchema.index({ location: "2dsphere" });
RestaurantSchema.index({ name: "text", keywords: "text", cuisineType: "text" });

delete mongoose.models.Restaurant;
export default mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
