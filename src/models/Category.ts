import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  restaurantId: mongoose.Types.ObjectId;
  menuId?: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ name: "text" });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
