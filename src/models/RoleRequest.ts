import mongoose, { Schema, Document } from "mongoose";

export interface IRoleRequest extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  requestedRoles: ("manager" | "staff" | "kitchen")[];
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
    requestedRoles: {
      type: [String],
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
// Clear the mongoose model cache for this model to ensure the new schema is applied during Next.js HMR
if (mongoose.models.RoleRequest) {
  delete mongoose.models.RoleRequest;
}

export default mongoose.model<IRoleRequest>("RoleRequest", RoleRequestSchema);
