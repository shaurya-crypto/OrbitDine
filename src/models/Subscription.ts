import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  restaurantId: Types.ObjectId;
  plan: "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "HALF_YEAR" | "ANNUAL" | "ENTERPRISE" | "FOUNDING_PARTNER";
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED" | "PAST_DUE" | "PENDING";
  billingCycle: "monthly" | "quarterly" | "half_year" | "annual" | "one_time";
  startedAt: Date;
  expiresAt: Date;
  trialEndsAt: Date | null;
  isFoundingPartner: boolean;
  foundingPartnerDiscount: number;
  autoRenew: boolean;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, unique: true },
    plan: {
      type: String,
      enum: ["FREE_TRIAL", "MONTHLY", "QUARTERLY", "HALF_YEAR", "ANNUAL", "ENTERPRISE", "FOUNDING_PARTNER"],
      required: true,
      default: "FREE_TRIAL"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "PAST_DUE", "PENDING"],
      required: true,
      default: "TRIAL"
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "half_year", "annual", "one_time"],
      required: true,
      default: "monthly"
    },
    startedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    trialEndsAt: { type: Date, default: null },
    isFoundingPartner: { type: Boolean, default: false },
    foundingPartnerDiscount: { type: Number, default: 0 },
    autoRenew: { type: Boolean, default: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for fast querying of expiring subscriptions and active checks
SubscriptionSchema.index({ status: 1, expiresAt: 1 });
SubscriptionSchema.index({ plan: 1 });

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
