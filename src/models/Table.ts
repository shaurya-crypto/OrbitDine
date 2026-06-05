import mongoose, { Schema, Document } from "mongoose";

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNumber: string;
  qrCodeId?: mongoose.Types.ObjectId;
  activeSessionId?: mongoose.Types.ObjectId;
  capacity?: number;
  floor?: string;
  section?: string;
  x?: number;
  y?: number;
  notes?: string;
  isActive: boolean;
  status: "available" | "reserved" | "ordering" | "preparing" | "bill_requested" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableNumber: {
      type: String,
      required: true,
    },
    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: "QRCode",
    },
    activeSessionId: {
      type: Schema.Types.ObjectId,
      ref: "OrderSession",
    },
    capacity: {
      type: Number,
    },
    floor: {
      type: String,
      trim: true,
      default: "Main Floor"
    },
    section: {
      type: String,
      trim: true,
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "ordering", "preparing", "bill_requested", "closed"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a table number is unique within a specific restaurant
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);
