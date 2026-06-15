import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import Restaurant from "@/models/Restaurant";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/services/email.service";
import { validateBody, SignupSchema } from "@/lib/api/validation";
import { rateLimiter } from "@/lib/api/rate-limit";
import { validateCSRF } from "@/lib/api/csrf";
import { handleApiError, unauthorized, tooManyRequests, badRequest } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimiter.check(`signup_${ip}`, 5, 3600000); // 5 per hour per IP
    if (!rl.success) {
      logger.warn(`Rate limit exceeded for signup from IP: ${ip}`);
      return tooManyRequests("Too many signup attempts from this IP.");
    }

    const isCsrfSafe = await validateCSRF();
    if (!isCsrfSafe) {
      return unauthorized("Invalid request origin");
    }

    // Since Signup payload can include extra fields not strictly in SignupSchema (like restaurantId, role),
    // we extract them separately or we could update the schema.
    // For now, we will validate the core fields, and extract the rest.
    const body = await req.json();
    const coreValidation = SignupSchema.safeParse(body);
    
    if (!coreValidation.success) {
      return badRequest("Invalid payload", coreValidation.error.format());
    }

    const { fullName, email, password } = coreValidation.data;
    const { restaurantId, role: requestedRole } = body;

    await connectToDatabase();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Attempt to register with existing email: ${email}`);
      // Send 400 instead of 409, or keep 409 but use our helper if it existed.
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const isCustomer = requestedRole === "customer";
    const isNewOwner = !restaurantId && !isCustomer;
    const assignedRole = isCustomer ? "customer" : (isNewOwner ? "owner" : (requestedRole || "staff"));
    const roles = [assignedRole]; // Store as array

    const newUser = await User.create({
      fullName,
      email,
      password,
      roles,
      restaurantId: isNewOwner ? undefined : restaurantId,
      isVerified: false,
    });

    const token = crypto.randomBytes(32).toString("hex");
    await VerificationToken.create({
      userId: newUser._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    try {
      await sendVerificationEmail(newUser.email, newUser.fullName, token);
    } catch (emailErr) {
      logger.error(`Failed to send verification email to ${email}`, emailErr);
      // We don't fail the signup, but log it.
    }

    logger.info(`New user signed up: ${newUser._id}`);

    return NextResponse.json(
      { message: "User created successfully. Please verify your email.", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Auth/Signup");
  }
}
