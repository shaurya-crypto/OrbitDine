import mongoose, { Schema, Document } from "mongoose";

export interface IIdempotencyRecord extends Document {
  key: string;
  endpoint: string;
  method: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responseBody: any;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

const IdempotencyRecordSchema = new Schema<IIdempotencyRecord>({
  key: { type: String, required: true, unique: true, index: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['PROCESSING', 'COMPLETED', 'FAILED'], required: true },
  responseBody: { type: Schema.Types.Mixed },
  statusCode: { type: Number },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL Index to automatically delete idempotency records after 24 hours
IdempotencyRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

delete mongoose.models.IdempotencyRecord;
export default mongoose.model<IIdempotencyRecord>("IdempotencyRecord", IdempotencyRecordSchema);
