import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Session from "@/models/Session";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import User from "@/models/User";

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

    // Fetch full user details to ensure role state is perfectly synced
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Backwards compatibility migration
    if (!user.roles || user.roles.length === 0) {
      user.roles = (user as any).role ? [(user as any).role] : ["customer"];
      await user.save();
    }

    // Rotate Refresh Token
    const payloadData: any = {
      userId: user._id.toString(),
      roles: Array.from(user.roles),
      isVerified: user.isVerified,
    };
    if (user.restaurantId) {
      payloadData.restaurantId = user.restaurantId.toString();
    }

    const newAccessToken = await signAccessToken(payloadData);

    // Extend Session expiration in DB but keep the same refresh token
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await session.save();

    const response = NextResponse.json({ 
      message: "Token refreshed",
      roles: user.roles,
      userId: user._id.toString(),
      restaurantId: user.restaurantId?.toString() || null,
      fullName: user.fullName
    });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    // We don't rotate the refresh token cookie to prevent race conditions in React strict mode

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
