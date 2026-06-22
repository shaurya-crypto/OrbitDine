import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Session from "@/models/Session";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { validateBody, LoginSchema } from "@/lib/api/validation";
import { rateLimiter } from "@/lib/api/rate-limit";
import { validateCSRF } from "@/lib/api/csrf";
import { handleApiError, unauthorized, tooManyRequests } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (5 requests per minute per IP)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimiter.check(`login_${ip}`, 5, 60000);
    if (!rl.success) {
      logger.warn(`Rate limit exceeded for login from IP: ${ip}`);
      return tooManyRequests();
    }

    // 2. CSRF Protection
    const isCsrfSafe = await validateCSRF();
    if (!isCsrfSafe) {
      return unauthorized("Invalid request origin");
    }

    // 3. Payload Validation
    const validation = await validateBody(req, LoginSchema);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error }, { status: 400 });
    }
    const { email, password, rememberMe } = validation.data;

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return unauthorized("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email} (invalid password)`);
      return unauthorized("Invalid credentials");
    }

    // Update lastLogin
    user.lastLogin = new Date();

    // Backwards compatibility migration
    if (!user.roles || user.roles.length === 0) {
      user.roles = (user as any).role ? [(user as any).role] : ["customer"];
    }

    await user.save();

    // Self-healing: if user has no restaurantId, try to find it
    let restaurantId = user.restaurantId;
    if (!restaurantId) {
      if (user.roles.includes("owner")) {
        const restaurant = await Restaurant.findOne({ ownerId: user._id });
        if (restaurant) {
          restaurantId = restaurant._id;
          await User.updateOne({ _id: user._id }, { $set: { restaurantId: restaurant._id } });
          logger.info(`Self-healed: linked owner ${user._id} to restaurant ${restaurant._id}`);
        }
      }
    }

    const payload = {
      userId: user._id.toString(),
      roles: Array.from(user.roles),
      isVerified: user.isVerified,
      restaurantId: restaurantId?.toString() || null,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Save session in DB
    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers.get("user-agent"),
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    logger.info(`Successful login for user: ${user._id}`);

    const response = NextResponse.json({ 
      message: "Login successful", 
      roles: user.roles,
      userId: user._id.toString(),
      restaurantId: restaurantId?.toString() || null,
      fullName: user.fullName
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

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
    return handleApiError(error, "Auth/Login");
  }
}
