import mongoose, { Schema, Document } from "mongoose";

export interface IRoleRequest extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  requestedRole: "manager" | "staff" | "kitchen";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const RoleRequestSchema = new Schema<IRoleRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ["manager", "staff", "kitchen"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.RoleRequest || mongoose.model<IRoleRequest>("RoleRequest", RoleRequestSchema);
