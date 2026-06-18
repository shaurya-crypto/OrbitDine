import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientId?: mongoose.Types.ObjectId; // User ID if targeted
  restaurantId?: mongoose.Types.ObjectId; // Restaurant ID if targeted
  audience: "user" | "restaurant" | "admin" | "broadcast";
  title: string;
  message: string;
  type: string; // "order_update" | "review" | "offer" | "announcement" | "alert" | "system"
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  image?: string;
  link?: string; // Redirect link
  ctaButton?: string; // Text for CTA button
  actionLink?: string; // Link for the action button
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    audience: {
      type: String,
      enum: ["user", "restaurant", "admin", "broadcast"],
      required: true,
      default: "user",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    image: {
      type: String,
    },
    link: {
      type: String,
    },
    ctaButton: {
      type: String,
    },
    actionLink: {
      type: String,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
