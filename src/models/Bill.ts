import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  billNumber: string;
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  orderIds: mongoose.Types.ObjectId[];
  itemsSnapshot: Array<{
    name: string;
    quantity: number;
    price: number;
    addons?: Array<{ name: string; price: number }>;
    itemTotal: number;
  }>;
  subtotal: number;
  discounts: Array<{
    source: string;
    title: string;
    amount: number;
  }>;
  totalDiscount: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
  status: "unpaid" | "paid" | "void";
  paymentMethod?: "card" | "cash" | "online";
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    billNumber: {
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
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "OrderSession",
      required: true,
      unique: true, // One bill per session
    },
    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    itemsSnapshot: [
      {
        name: String,
        quantity: Number,
        price: Number,
        addons: [
          {
            name: String,
            price: Number,
          },
        ],
        itemTotal: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discounts: [
      {
        source: String,
        title: String,
        amount: Number,
      },
    ],
    totalDiscount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "paid", "void"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "online"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
