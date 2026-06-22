import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId | "system";
  actorRole: "owner" | "manager" | "admin" | "system";
  restaurantId?: mongoose.Types.ObjectId;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetType?: "Restaurant" | "User" | "Subscription" | "System" | "Warning" | "Report" | "Menu" | "Order" | "Review";
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.Mixed, // Can be ObjectId or "system" string
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ["owner", "manager", "admin", "system"],
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["Restaurant", "User", "Subscription", "System", "Warning", "Report", "Menu", "Order", "Review"],
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    beforeState: {
      type: Schema.Types.Mixed,
    },
    afterState: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable ledger, no updates
  }
);

// Prevent updates and deletions at the schema level
AuditLogSchema.pre("updateOne", function(next: any) {
  next(new Error("Audit logs cannot be updated"));
});
AuditLogSchema.pre("deleteOne", function(next: any) {
  next(new Error("Audit logs cannot be deleted"));
});
AuditLogSchema.pre("deleteMany", function(next: any) {
  next(new Error("Audit logs cannot be deleted"));
});

delete mongoose.models.AuditLog;
export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
