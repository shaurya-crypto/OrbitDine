import mongoose, { Schema, Document } from "mongoose";

export interface IBackupJob extends Document {
  backupId: string;
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  restaurantId: mongoose.Types.ObjectId;
  status: "pending" | "running" | "completed" | "failed";
  size: number;
  recordCount: number;
  checksum?: string;
  schemaVersion: string;
  failureReason?: string;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BackupJobSchema = new Schema<IBackupJob>(
  {
    backupId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
      index: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    checksum: {
      type: String,
    },
    schemaVersion: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for history lookups
BackupJobSchema.index({ restaurantId: 1, createdAt: -1 });

export default mongoose.models.BackupJob || mongoose.model<IBackupJob>("BackupJob", BackupJobSchema);
