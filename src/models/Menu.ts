import mongoose, { Schema, Document } from "mongoose";

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string; // e.g. "Main Menu", "Drinks", "Specials"
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "Main Menu",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);
