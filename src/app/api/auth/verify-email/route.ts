import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import VerificationToken from "@/models/VerificationToken";
import User from "@/models/User";
import Session from "@/models/Session";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectToDatabase();

    const verificationToken = await VerificationToken.findOne({
      token,
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Generate tokens for auto-login
    const payload = {
      userId: user._id.toString(),
      roles: Array.from(user.roles || ["customer"]),
      isVerified: true,
      restaurantId: user.restaurantId?.toString() || null,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers.get("user-agent"),
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    const response = NextResponse.json({ 
      message: "Email verified successfully",
      userId: user._id.toString(),
      roles: payload.roles,
      restaurantId: payload.restaurantId,
      fullName: user.fullName
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
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
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
