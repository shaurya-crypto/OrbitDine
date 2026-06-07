import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEvent extends Document {
  restaurantId?: mongoose.Types.ObjectId;
  sessionId?: string; // Links to the guest session
  customerId?: mongoose.Types.ObjectId; // Links to registered user if migrated
  eventType: "item_view" | "item_click" | "add_to_cart" | "checkout" | "restaurant_view" | "restaurant_click" | "discovery_search" | "menu_open";
  itemId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    eventType: {
      type: String,
      enum: ["item_view", "item_click", "add_to_cart", "checkout", "restaurant_view", "restaurant_click", "discovery_search", "menu_open"],
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Events are immutable
  }
);

export default mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
