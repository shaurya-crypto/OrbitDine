import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import { SignJWT } from "jose";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: "Missing Google token" }, { status: 400 });
    }

    // Verify token with Google and get user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userInfoRes.ok) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    const payload = await userInfoRes.json();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      // User exists, log them in
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
      const token = await new SignJWT({ 
        userId: existingUser._id.toString(),
        roles: Array.from(existingUser.roles),
        restaurantId: existingUser.restaurantId?.toString()
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const response = NextResponse.json({
        message: "Login successful",
        token,
        userId: existingUser._id.toString(),
        roles: existingUser.roles,
        restaurantId: existingUser.restaurantId?.toString(),
        fullName: existingUser.fullName,
      }, { status: 200 });

      response.cookies.set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } else {
      // User does NOT exist, trigger role selection on frontend
      return NextResponse.json({
        status: "requires_role_selection",
        email: payload.email,
        fullName: payload.name,
        profileImage: payload.picture,
        googleId: payload.sub,
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Google authentication failed" }, { status: 500 });
  }
}
