import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  restaurantId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  rating: number;
  feedback?: string;
  createdAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "OrderSession" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const ReviewModel: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default ReviewModel;
