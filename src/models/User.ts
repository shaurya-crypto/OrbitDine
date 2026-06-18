import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string; // Optional because OAuth might not have a password
  roles: ("owner" | "manager" | "staff" | "kitchen" | "customer" | "superadmin")[];
  restaurantId?: mongoose.Types.ObjectId;
  savedRestaurants: mongoose.Types.ObjectId[];
  followingRestaurants: mongoose.Types.ObjectId[];
  favoriteItems: mongoose.Types.ObjectId[];
  recentlyViewedRestaurants: mongoose.Types.ObjectId[];
  recentlyViewedItems: mongoose.Types.ObjectId[];
  totalOrders: number;
  totalSpent: number;
  achievements: string[];
  isVerified: boolean;
  profileImage?: string;
  lastLogin?: Date;
  locationEnabled?: boolean;
  defaultCity?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    roles: {
      type: [String],
      enum: ["owner", "manager", "staff", "kitchen", "customer", "superadmin"],
      default: ["customer"],
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    savedRestaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    followingRestaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    favoriteItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
    recentlyViewedRestaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    recentlyViewedItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    achievements: [
      {
        type: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    locationEnabled: {
      type: Boolean,
      default: false,
    },
    defaultCity: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pre-save hook to hash password before saving
UserSchema.pre("save", async function (this: any) {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

delete mongoose.models.User;
export default mongoose.model<IUser>("User", UserSchema);
