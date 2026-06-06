import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  addons?: Array<{ name: string; price: number }>;
  notes?: string;
}

export interface IOrderSession extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  qrCodeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  cart: Array<{
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    image?: string;
    category?: string;
    quantity: number;
    addons?: Array<{ name: string; price: number }>;
    notes?: string;
    itemTotal: number;
  }>;
  appliedDiscounts?: Array<{
    source: "loyalty" | "game" | "manual";
    title: string;
    amount: number;
  }>;
  orderIds: mongoose.Types.ObjectId[];
  billRequested: boolean;
  status: "active" | "completed" | "cancelled";
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSessionSchema = new Schema<IOrderSession>(
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
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: "QRCode",
      required: true,
    },
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    cart: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: String,
        category: String,
        quantity: { type: Number, required: true, default: 1 },
        addons: [
          {
            name: String,
            price: Number,
          },
        ],
        notes: String,
        itemTotal: { type: Number, required: true },
      },
    ],
    appliedDiscounts: [
      {
        source: {
          type: String,
          enum: ["loyalty", "game", "manual"],
          required: true,
        },
        title: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    billRequested: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.OrderSession;
export default mongoose.model<IOrderSession>("OrderSession", OrderSessionSchema);
