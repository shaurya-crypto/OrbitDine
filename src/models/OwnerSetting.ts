import mongoose, { Schema, Document } from "mongoose";

export interface IOwnerSetting extends Document {
  restaurantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  globalNotificationsEnabled: boolean;
  kitchenCanCancelOrder: boolean;
  routing: {
    orderCreated: string[];
    orderStatusChanged: string[];
    billRequested: string[];
    foodReminder: string[];
    serveReminder: string[];
    emergency: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSettingSchema = new Schema<IOwnerSetting>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    globalNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    kitchenCanCancelOrder: {
      type: Boolean,
      default: false,
    },
    routing: {
      orderCreated: { type: [String], default: ["kitchen", "staff", "manager", "owner"] },
      orderStatusChanged: { type: [String], default: ["kitchen", "staff", "manager", "owner"] },
      billRequested: { type: [String], default: ["staff", "manager", "owner"] },
      foodReminder: { type: [String], default: ["kitchen", "staff", "manager", "owner"] },
      serveReminder: { type: [String], default: ["staff", "manager", "owner"] },
      emergency: { type: [String], default: ["owner", "manager", "staff", "kitchen"] },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one setting per owner per restaurant
OwnerSettingSchema.index({ restaurantId: 1, ownerId: 1 }, { unique: true });

delete mongoose.models.OwnerSetting;
export default mongoose.model<IOwnerSetting>("OwnerSetting", OwnerSettingSchema);
