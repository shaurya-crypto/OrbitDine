import mongoose, { Schema, Document } from "mongoose";

export interface IBackupConfig extends Document {
  restaurantId: mongoose.Types.ObjectId;
  enabled: boolean;
  frequency: "manual" | "daily" | "weekly" | "monthly" | "custom";
  retentionDays: number;
  includeOrders: boolean;
  includeReviews: boolean;
  includeCustomers: boolean;
  includeMenu: boolean;
  includeAnalytics: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BackupConfigSchema = new Schema<IBackupConfig>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["manual", "daily", "weekly", "monthly", "custom"],
      default: "manual",
    },
    retentionDays: {
      type: Number,
      default: 30,
    },
    includeOrders: { type: Boolean, default: true },
    includeReviews: { type: Boolean, default: true },
    includeCustomers: { type: Boolean, default: true },
    includeMenu: { type: Boolean, default: true },
    includeAnalytics: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BackupConfig || mongoose.model<IBackupConfig>("BackupConfig", BackupConfigSchema);
