import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  restaurantId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  rating: number; // e.g. 1-5
  foodQuality?: number;
  serviceQuality?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    foodQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
