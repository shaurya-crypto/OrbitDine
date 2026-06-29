import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEvent extends Document {
  restaurantId?: mongoose.Types.ObjectId;
  sessionId?: string; // Links to the guest session
  customerId?: mongoose.Types.ObjectId; // Links to registered user if migrated
  eventType: string;
  itemId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const VALID_EVENT_TYPES = [
  "item_view", "item_click", "add_to_cart", "remove_from_cart", "quantity_change",
  "checkout", "checkout_started", "restaurant_view", "restaurant_click",
  "discovery_search", "menu_open", "menu_close", "cart_abandonment",
  "follow", "unfollow", "favorite", "unfavorite", "favorite_added", "favorite_removed",
  "filter_applied", "review_created", "promotion_clicked", "promotion_viewed",
  "coupon_applied", "coupon_redeemed", "search_result_clicked",
  "table_qr_scanned", "qr_scanned", "recommendation_clicked", "recommendation_viewed",
  "login", "logout", "registration", "profile_update",
  "payment_success", "payment_failed",
  "dashboard_visit", "billing_visit", "subscription_upgrade",
  "notification_click", "referral_shared", "reward_redeemed",
];

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
      enum: VALID_EVENT_TYPES,
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
    timeseries: {
      timeField: "createdAt",
      metaField: "restaurantId",
      granularity: "seconds"
    }
  }
);

export default mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
