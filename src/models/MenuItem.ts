import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  veg?: boolean;
  available: boolean;
  addons?: Array<{ name: string; price: number }>;
  tags?: string[];
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
    tags: [String],
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

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
