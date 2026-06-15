import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId; // User ID
  targetId: mongoose.Types.ObjectId; // Can be a Restaurant, User, or Review ID
  targetType: "Restaurant" | "User" | "Review";
  reason: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  assignedTo?: mongoose.Types.ObjectId; // Superadmin ID handling it
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["Restaurant", "User", "Review"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.Report;
export default mongoose.model<IReport>("Report", ReportSchema);
