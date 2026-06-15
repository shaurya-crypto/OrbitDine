import mongoose, { Schema, Document } from "mongoose";

export interface IWarning extends Document {
  restaurantId: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId; // Superadmin ID
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  notes?: string;
  status: "active" | "acknowledged" | "resolved" | "expired";
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WarningSchema = new Schema<IWarning>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.Warning;
export default mongoose.model<IWarning>("Warning", WarningSchema);
