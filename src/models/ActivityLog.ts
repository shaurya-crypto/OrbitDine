import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  restaurantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
