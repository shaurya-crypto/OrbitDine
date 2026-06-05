import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Session from "@/models/Session";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Self-healing: if user has no restaurantId, try to find it
    let restaurantId = user.restaurantId;
    if (!restaurantId) {
      // For owners, look up by ownerId
      if (user.role === "owner") {
        const restaurant = await Restaurant.findOne({ ownerId: user._id });
        if (restaurant) {
          restaurantId = restaurant._id;
          await User.updateOne({ _id: user._id }, { $set: { restaurantId: restaurant._id } });
          console.log(`[Login] Self-healed: linked owner ${user._id} to restaurant ${restaurant._id}`);
        }
      }
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      isVerified: user.isVerified,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Save session in DB
    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers.get("user-agent"),
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    const response = NextResponse.json({ 
      message: "Login successful", 
      role: user.role,
      userId: user._id.toString(),
      restaurantId: restaurantId?.toString() || null,
      fullName: user.fullName
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 15 * 60; // 30 days or 15 minutes

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
