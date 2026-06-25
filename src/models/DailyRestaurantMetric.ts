import mongoose, { Schema, Document } from "mongoose";

export interface IDailyRestaurantMetric extends Document {
  restaurantId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  
  // Sales & Orders
  orders: number;
  revenue: number;
  profit: number;
  avgOrderValue: number;
  cancellationRate: number;
  
  // Customers
  customers: number;
  newCustomers: number;
  repeatCustomers: number;
  
  // Feedback
  reviewCount: number;
  averageRating: number;
  sentimentScore: number;
  
  // Operations
  averagePrepTimeMs: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const DailyRestaurantMetricSchema = new Schema<IDailyRestaurantMetric>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for fast querying
      required: true,
      index: true,
    },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    
    customers: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    sentimentScore: { type: Number, default: 0 },
    
    averagePrepTimeMs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by restaurant and date range
DailyRestaurantMetricSchema.index({ restaurantId: 1, date: -1 }, { unique: true });

export default mongoose.models.DailyRestaurantMetric || mongoose.model<IDailyRestaurantMetric>("DailyRestaurantMetric", DailyRestaurantMetricSchema);
