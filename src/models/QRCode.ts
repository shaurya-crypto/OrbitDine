import mongoose, { Schema, Document } from "mongoose";

export interface IQRCode extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId?: mongoose.Types.ObjectId;
  qrImage: string;
  code: string;
  active: boolean;
  type: "table" | "pickup" | "takeaway";
  scanCount: number;
  lastScanTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
    },
    qrImage: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["table", "pickup", "takeaway"],
      default: "table",
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScanTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.QRCode || mongoose.model<IQRCode>("QRCode", QRCodeSchema);
