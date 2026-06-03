import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  cuisineType?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  city?: string;
  state?: string;
  country?: string;
  totalTables: number;
  settings: {
    taxPercentage: number;
    serviceChargePercentage: number;
    currency: string;
    loyaltyEnabled: boolean;
    gameZoneEnabled: boolean;
  };
  plan: "free" | "pro" | "enterprise";
  status: "pending" | "active" | "suspended";
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
    description: {
      type: String,
    },
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
    totalTables: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
