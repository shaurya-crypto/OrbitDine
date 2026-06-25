import mongoose, { Schema, Document } from "mongoose";

export interface IForecastMetric extends Document {
  restaurantId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD (the date being predicted)
  predictedOrders: number;
  predictedRevenue: number;
  confidence: number; // 0-100 percentage
  
  // Potential external factors influencing this prediction
  exogenousFactors?: {
    weatherCondition?: string;
    isHoliday?: boolean;
    localEventsCount?: number;
  };
  
  actualOrders?: number;
  actualRevenue?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ForecastMetricSchema = new Schema<IForecastMetric>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    predictedOrders: { type: Number, required: true },
    predictedRevenue: { type: Number, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    
    exogenousFactors: {
      weatherCondition: String,
      isHoliday: Boolean,
      localEventsCount: Number,
    },
    
    // For evaluating model accuracy post-facto
    actualOrders: { type: Number },
    actualRevenue: { type: Number },
  },
  {
    timestamps: true,
  }
);

ForecastMetricSchema.index({ restaurantId: 1, date: -1 }, { unique: true });

export default mongoose.models.ForecastMetric || mongoose.model<IForecastMetric>("ForecastMetric", ForecastMetricSchema);
