import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerCohort extends Document {
  restaurantId: mongoose.Types.ObjectId;
  cohortMonth: string; // YYYY-MM
  customerCount: number; // Number of unique new customers acquired in this month
  
  // Retention percentages or raw counts
  retention30: number; // Active 30 days later
  retention60: number; // Active 60 days later
  retention90: number; // Active 90 days later
  retention180: number; // Active 180 days later
  retention365: number; // Active 365 days later
  
  createdAt: Date;
  updatedAt: Date;
}

const CustomerCohortSchema = new Schema<ICustomerCohort>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    cohortMonth: {
      type: String, // Stored as YYYY-MM
      required: true,
      index: true,
    },
    customerCount: { type: Number, default: 0 },
    retention30: { type: Number, default: 0 },
    retention60: { type: Number, default: 0 },
    retention90: { type: Number, default: 0 },
    retention180: { type: Number, default: 0 },
    retention365: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index
CustomerCohortSchema.index({ restaurantId: 1, cohortMonth: -1 }, { unique: true });

export default mongoose.models.CustomerCohort || mongoose.model<ICustomerCohort>("CustomerCohort", CustomerCohortSchema);
