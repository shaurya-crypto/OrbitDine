import mongoose, { Schema, Document } from "mongoose";

export interface IManager extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  permissions: string[]; // e.g. ['menu_management', 'staff_management']
  status: "pending" | "active" | "suspended";
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema = new Schema<IManager>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only be a manager for a restaurant once
ManagerSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

export default mongoose.models.Manager || mongoose.model<IManager>("Manager", ManagerSchema);
