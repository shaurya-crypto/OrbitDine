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
    const { fullName, email, password, restaurantId } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const isNewOwner = !restaurantId;
    const role = isNewOwner ? "owner" : "staff"; // Changed from 'customer' to 'staff' if invited. Customers don't use this signup.

    // Step 1: Create the user first
    const newUser = await User.create({
      fullName,
      email,
      password,
      role,
      restaurantId: isNewOwner ? undefined : restaurantId,
      isVerified: false,
    });

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
