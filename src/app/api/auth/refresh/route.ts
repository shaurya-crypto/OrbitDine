import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Session from "@/models/Session";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies?.get("refreshToken")?.value;
    
    // In Edge functions / route handlers without cookie helper:
    // const cookieHeader = req.headers.get("cookie")
    
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    await connectToDatabase();

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // Check if session exists in DB
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      // Possible token reuse attack
      await Session.deleteMany({ userId: payload.userId });
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Rotate Refresh Token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      role: payload.role,
      isVerified: payload.isVerified,
    });
    const newRefreshToken = await signRefreshToken({
      userId: payload.userId,
      role: payload.role,
      isVerified: payload.isVerified,
    });

    // Update Session in DB
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await session.save();

    const response = NextResponse.json({ message: "Token refreshed" });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
