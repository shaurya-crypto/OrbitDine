import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  restaurantId: mongoose.Types.ObjectId;
  tableId?: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  items: Array<{
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    addons?: Array<{ name: string; price: number }>;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
  status: "received" | "preparing" | "ready" | "served" | "cancelled";
  statusHistory: Array<{
    status: string;
    timestamp: Date;
  }>;
  notes?: string;
  servedAt?: Date;
  servedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
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
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "OrderSession",
      required: true,
    },
    items: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        addons: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["received", "preparing", "ready", "served", "cancelled"],
      default: "received",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
    servedAt: { type: Date },
    servedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
