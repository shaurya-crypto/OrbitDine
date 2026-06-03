import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import Restaurant from "@/models/Restaurant";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/services/email.service";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { fullName, email, password, restaurantName, restaurantId } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!restaurantName && !restaurantId) {
      return NextResponse.json({ error: "Either a Restaurant Name or an Invite Link is required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const isNewOwner = !restaurantId && !!restaurantName;
    const role = isNewOwner ? "owner" : "customer";

    // Step 1: Create the user first (without restaurantId for owners, since restaurant doesn't exist yet)
    const newUser = await User.create({
      fullName,
      email,
      password,
      role,
      restaurantId: isNewOwner ? undefined : restaurantId,
      isVerified: false,
    });

    let finalRestaurantId = restaurantId;

    // Step 2: If new owner, create the restaurant linked to the new user
    if (isNewOwner) {
      const slug = restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + crypto.randomBytes(3).toString("hex");

      const newRestaurant = await Restaurant.create({
        ownerId: newUser._id,
        name: restaurantName,
        slug,
        settings: {
          currency: "USD",
          taxPercentage: 10,
          serviceChargePercentage: 0,
        },
      });

      finalRestaurantId = newRestaurant._id.toString();

      // Step 3: NOW update the user with the restaurant's real _id using $set
      await User.updateOne(
        { _id: newUser._id },
        { $set: { restaurantId: newRestaurant._id } }
      );
      console.log(`[Signup] Linked user ${newUser._id} to restaurant ${newRestaurant._id}`);
    }

    // Step 4: Generate Verification Token
    const token = crypto.randomBytes(32).toString("hex");
    await VerificationToken.create({
      userId: newUser._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Step 5: Send Verification Email
    await sendVerificationEmail(newUser.email, newUser.fullName, token);

    return NextResponse.json(
      { message: "User created successfully. Please verify your email.", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
