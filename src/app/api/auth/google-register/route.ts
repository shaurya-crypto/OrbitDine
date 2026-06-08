import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, profileImage, googleId, role, restaurantId } = body;

    if (!email || !fullName || !googleId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Role validation
    const validRoles = ["owner", "manager", "staff", "kitchen", "customer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const newUser = await User.create({
      fullName,
      email,
      roles: [role],
      restaurantId: restaurantId || undefined,
      profileImage,
      isVerified: true, // Google emails are already verified
      // Password is not set, meaning they can only log in via Google unless they set one later
    });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
    const token = await new SignJWT({ 
      userId: newUser._id.toString(),
      roles: Array.from(newUser.roles),
      restaurantId: newUser.restaurantId?.toString()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    const response = NextResponse.json({
      message: "Registration successful",
      token,
      userId: newUser._id.toString(),
      roles: newUser.roles,
      restaurantId: newUser.restaurantId?.toString(),
      fullName: newUser.fullName,
    }, { status: 201 });

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Google Register Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
