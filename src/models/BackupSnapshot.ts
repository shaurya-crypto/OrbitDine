import mongoose, { Schema, Document } from "mongoose";

export interface IBackupSnapshot extends Document {
  backupJobId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  storageKey: string;
  checksum: string;
  compressedSize: number;
  schemaVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const BackupSnapshotSchema = new Schema<IBackupSnapshot>(
  {
    backupJobId: {
      type: Schema.Types.ObjectId,
      ref: "BackupJob",
      required: true,
      unique: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
    },
    compressedSize: {
      type: Number,
      required: true,
    },
    schemaVersion: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BackupSnapshotSchema.index({ restaurantId: 1, createdAt: -1 });

export default mongoose.models.BackupSnapshot || mongoose.model<IBackupSnapshot>("BackupSnapshot", BackupSnapshotSchema);
