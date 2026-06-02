import mongoose, { Schema, Document } from "mongoose";

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNumber: string;
  qrCode?: mongoose.Types.ObjectId;
  capacity?: number;
  active: boolean;
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
    qrCode: {
      type: Schema.Types.ObjectId,
      ref: "QRCode",
    },
    capacity: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a table number is unique within a specific restaurant
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);
