import mongoose, { Schema, Document } from "mongoose";

export interface IRestoreJob extends Document {
  jobId: string;
  snapshotId: string; // The ID of the BackupSnapshot being restored
  restaurantId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: "owner" | "admin" | "superadmin" | "system";
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsFailed: number;
  failureReason?: string;
  preRestoreSnapshotId?: mongoose.Types.ObjectId; // Link to the emergency snapshot taken before this restore
  createdAt: Date;
  updatedAt: Date;
}

const RestoreJobSchema = new Schema<IRestoreJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    snapshotId: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
      enum: ["owner", "admin", "superadmin", "system"],
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
      index: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    recordsProcessed: {
      type: Number,
      default: 0,
    },
    recordsUpdated: {
      type: Number,
      default: 0,
    },
    recordsCreated: {
      type: Number,
      default: 0,
    },
    recordsFailed: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
    },
    preRestoreSnapshotId: {
      type: Schema.Types.ObjectId,
      ref: "BackupSnapshot",
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.RestoreJob;
export default mongoose.model<IRestoreJob>("RestoreJob", RestoreJobSchema);
