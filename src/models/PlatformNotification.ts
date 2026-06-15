import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformNotification extends Document {
  title: string;
  message: string;
  type: "maintenance" | "offer" | "emergency" | "announcement" | "alert";
  targetAudience: "all" | "owners" | "managers" | "staff" | "customers" | "specific_restaurant";
  targetRestaurantId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId; // Superadmin ID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformNotificationSchema = new Schema<IPlatformNotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["maintenance", "offer", "emergency", "announcement", "alert"],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "owners", "managers", "staff", "customers", "specific_restaurant"],
      required: true,
    },
    targetRestaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    expiresAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.PlatformNotification;
export default mongoose.model<IPlatformNotification>("PlatformNotification", PlatformNotificationSchema);
