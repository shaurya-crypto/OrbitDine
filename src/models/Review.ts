import mongoose, { Schema, Document, Model } from "mongoose";
import { softDeletePlugin, ISoftDeleted } from "@/lib/mongodb/softDeletePlugin";

export interface IReview extends Document, ISoftDeleted {
  restaurantId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  feedback?: string;
  reviewSource?: "qr" | "web" | "app";
  visitDate?: Date;
  orderReference?: string;
  sentimentScore?: number;
  sentimentLabel?: "positive" | "neutral" | "negative";
  extractedKeywords?: string[];
  keywords?: string[];
  analyzedAt?: Date;
  moderationStatus: "pending" | "approved" | "rejected";
  flagged: boolean;
  flaggedReason?: string;
  helpfulVotes: number;
  restaurantReply?: string;
  restaurantRepliedAt?: Date;
  isVerifiedDiner: boolean;
  createdAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "OrderSession" },
  customerId: { type: Schema.Types.ObjectId, ref: "User" },
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  foodRating: { type: Number, min: 1, max: 5 },
  serviceRating: { type: Number, min: 1, max: 5 },
  ambienceRating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, maxlength: 1000 },
  reviewSource: { type: String, enum: ["qr", "web", "app"], default: "web" },
  visitDate: { type: Date },
  orderReference: { type: String },
  sentimentScore: { type: Number },
  sentimentLabel: { type: String, enum: ["positive", "neutral", "negative"] },
  extractedKeywords: [{ type: String }],
  keywords: [{ type: String }],
  analyzedAt: { type: Date },
  moderationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  flagged: { type: Boolean, default: false },
  flaggedReason: { type: String },
  helpfulVotes: { type: Number, default: 0 },
  restaurantReply: { type: String, maxlength: 2000 },
  restaurantRepliedAt: { type: Date },
  isVerifiedDiner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.plugin(softDeletePlugin);

const ReviewModel: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default ReviewModel;
