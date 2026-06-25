import mongoose, { Schema, Document } from "mongoose";
import { softDeletePlugin, ISoftDeleted } from "@/lib/mongodb/softDeletePlugin";

export interface IMenuItem extends Document, ISoftDeleted {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  veg?: boolean;
  available: boolean;
  addons?: Array<{ name: string; price: number }>;
  ingredients?: string[];
  allergens?: string[];
  dietaryTags?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  tags?: string[];
  vectorEmbedding?: number[];
  flavorProfile?: string[];
  spiceLevel?: number;
  seasonalityTags?: string[];
  aiTags?: string[];
  popularityScore?: number;
  cogs?: number;
  profitMargin?: number;
  isBestseller?: boolean;
  isRecommended?: boolean;
  chefSpecial?: boolean;
  mostOrdered?: boolean;
  isNewArrival?: boolean;
  limitedTimeOffer?: boolean;
  ltoStartDate?: Date;
  ltoEndDate?: Date;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    veg: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
    addons: [
      {
        name: String,
        price: Number,
      },
    ],
    ingredients: [String],
    allergens: [String],
    dietaryTags: [String],
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    tags: [String],
    vectorEmbedding: [Number],
    flavorProfile: [String],
    spiceLevel: {
      type: Number,
      min: 0,
      max: 5,
    },
    seasonalityTags: [String],
    aiTags: [String],
    popularityScore: {
      type: Number,
      default: 0,
    },
    cogs: Number,
    profitMargin: Number,
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    chefSpecial: {
      type: Boolean,
      default: false,
    },
    mostOrdered: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    limitedTimeOffer: {
      type: Boolean,
      default: false,
    },
    ltoStartDate: {
      type: Date,
    },
    ltoEndDate: {
      type: Date,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MenuItemSchema.plugin(softDeletePlugin);

MenuItemSchema.index({
  name: "text",
  description: "text",
  ingredients: "text",
  allergens: "text",
  dietaryTags: "text",
  tags: "text",
});

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
