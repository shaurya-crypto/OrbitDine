import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import Category from "@/models/Category";
import qrcodeLib from "qrcode";
import crypto from "crypto";
import { validateBody, RestaurantOnboardingSchema } from "@/lib/api/validation";
import { rateLimiter } from "@/lib/api/rate-limit";
import { validateCSRF } from "@/lib/api/csrf";
import { handleApiError, unauthorized, tooManyRequests, badRequest } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimiter.check(`onboarding_${ip}`, 3, 3600000); // 3 per hour
    if (!rl.success) {
      logger.warn(`Rate limit exceeded for onboarding from IP: ${ip}`);
      return tooManyRequests("Too many onboarding attempts. Try again later.");
    }

    const isCsrfSafe = await validateCSRF();
    if (!isCsrfSafe) {
      return unauthorized("Invalid request origin");
    }

    const validation = await validateBody(req, RestaurantOnboardingSchema);
    if (!validation.success) {
      return badRequest("Invalid onboarding data", validation.error);
    }

    await dbConnect();
    
    const { 
      userId, restaurantName, address, city, cuisineType, totalTables,
      restaurantType, country, state, pinCode, staffCount, openingHours, closingHours,
      phone, email, latitude, longitude
    } = validation.data;

    const user = await User.findById(userId);
    if (!user) {
      return badRequest("User not found");
    }

    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + crypto.randomBytes(3).toString("hex");

    let restaurant = await Restaurant.findOne({ ownerId: userId });
    
    if (!restaurant) {
      restaurant = await Restaurant.create({
        ownerId: userId,
        name: restaurantName,
        slug,
        address,
        city,
        cuisineType,
        totalTables,
        restaurantType,
        country,
        state,
        pinCode,
        staffCount,
        openingHours,
        closingHours,
        phone,
        email,
        latitude,
        longitude,
        status: "active",
        settings: {
          currency: "USD",
          taxPercentage: 10,
          serviceChargePercentage: 0,
        },
      });

      await User.updateOne({ _id: userId }, { 
        $set: { restaurantId: restaurant._id },
        $addToSet: { roles: "owner" }
      });
      logger.info(`Created new restaurant ${restaurant._id} for owner ${userId}`);
    } else {
      restaurant.name = restaurantName;
      restaurant.address = address;
      restaurant.city = city;
      restaurant.cuisineType = cuisineType;
      restaurant.totalTables = totalTables;
      restaurant.restaurantType = restaurantType;
      restaurant.country = country;
      restaurant.state = state;
      restaurant.pinCode = pinCode;
      restaurant.staffCount = staffCount;
      restaurant.openingHours = openingHours;
      restaurant.closingHours = closingHours;
      restaurant.phone = phone;
      restaurant.email = email;
      restaurant.latitude = latitude;
      restaurant.longitude = longitude;
      restaurant.status = "active";
      await restaurant.save();
      logger.info(`Updated restaurant ${restaurant._id} during onboarding replay`);
    }
    
    const restaurantId = restaurant._id;

    // Clear existing tables and QR codes for clean onboarding
    await Table.deleteMany({ restaurantId });
    await QRCode.deleteMany({ restaurantId });
    await Category.deleteMany({ restaurantId });

    // Generate Default Categories
    const defaultCategories = ["Appetizers", "Main Course", "Desserts", "Beverages"];
    for (let i = 0; i < defaultCategories.length; i++) {
      const cat = new Category({
        restaurantId,
        name: defaultCategories[i],
        sortOrder: i,
      });
      await cat.save();
    }

    // Generate Tables and QRCodes
    for (let i = 1; i <= totalTables; i++) {
      const table = new Table({
        restaurantId,
        tableNumber: i.toString(),
        isActive: true,
        status: "available",
      });
      await table.save();

      const code = crypto.randomBytes(4).toString("hex"); // 8-char hex
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/scan/${code}`;
      const qrImage = await qrcodeLib.toDataURL(url);

      const qr = new QRCode({
        restaurantId,
        tableId: table._id,
        code,
        qrImage,
        active: true,
        type: "table",
      });
      await qr.save();

      table.qrCodeId = qr._id;
      await table.save();
    }

    const response = NextResponse.json({ message: "Onboarding complete", restaurant });

    // Issue a new token with the restaurantId so proxy knows they have a restaurant
    const { signAccessToken } = await import("@/lib/auth/jwt");
    const payload = {
      userId: user._id.toString(),
      roles: Array.from(user.roles || ["owner"]),
      isVerified: user.isVerified,
      restaurantId: restaurantId.toString(),
    };
    const newAccessToken = await signAccessToken(payload);
    
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes as per new security policy
      path: "/",
    });

    return response;
  } catch (error: any) {
    return handleApiError(error, "Onboarding");
  }
}
