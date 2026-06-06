import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Table from "@/models/Table";
import QRCode from "@/models/QRCode";
import Category from "@/models/Category";
import qrcodeLib from "qrcode";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      userId, restaurantName, address, city, cuisineType, totalTables,
      restaurantType, country, state, pinCode, staffCount, openingHours, closingHours,
      phone, email, latitude, longitude
    } = body;

    if (!userId || !restaurantName || !address || !city || !cuisineType || typeof totalTables !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({ message: "Onboarding complete", restaurant });
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
