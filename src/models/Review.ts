import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
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
  extractedKeywords?: string[];
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
  extractedKeywords: [{ type: String }],
  moderationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  flagged: { type: Boolean, default: false },
  flaggedReason: { type: String },
  helpfulVotes: { type: Number, default: 0 },
  restaurantReply: { type: String, maxlength: 2000 },
  restaurantRepliedAt: { type: Date },
  isVerifiedDiner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ReviewModel: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default ReviewModel;
