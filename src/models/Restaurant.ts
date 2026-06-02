import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  restaurantName: string;
  slug: string;
  logo?: string;
  description?: string;
  cuisineType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  totalTables: number;
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
    restaurantName: {
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
    address: {
      type: String,
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
