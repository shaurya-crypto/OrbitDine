import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISoftDeleted extends Document {
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  deletionReason: string | null;
  softDelete: (deletedBy?: Types.ObjectId | string, reason?: string) => Promise<this>;
  restore: () => Promise<this>;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
      index: { sparse: true }, // Sparse index for faster active record queries
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletionReason: {
      type: String,
      default: null,
    },
  });

  // Soft Delete Instance Method
  schema.methods.softDelete = async function (deletedBy?: Types.ObjectId | string, reason?: string) {
    this.deletedAt = new Date();
    if (deletedBy) this.deletedBy = deletedBy;
    if (reason) this.deletionReason = reason;
    return this.save();
  };

  // Restore Instance Method
  schema.methods.restore = async function () {
    this.deletedAt = null;
    this.deletedBy = null;
    this.deletionReason = null;
    return this.save();
  };

  // -------------------------------------------------------------
  // Query Interception to exclude Soft Deleted records by default
  // -------------------------------------------------------------
  const excludeDeleted = function (this: any) {
    // We only inject deletedAt: null if the query hasn't explicitly specified deletedAt
    if (this.getQuery().deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);

  // Aggregate Interception
  schema.pre("aggregate", function (this: any) {
    const pipeline = this.pipeline();
    // Insert a match stage at the very beginning to filter out deleted documents
    if (pipeline.length > 0 && pipeline[0].$match) {
      if (pipeline[0].$match.deletedAt === undefined) {
        pipeline[0].$match.deletedAt = null;
      }
    } else {
      pipeline.unshift({ $match: { deletedAt: null } });
    }
  });
}
