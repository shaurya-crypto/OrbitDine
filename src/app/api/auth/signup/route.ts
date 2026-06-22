import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/services/email.service";
import { SignupSchema } from "@/lib/api/validation";
import { processSecurityPipeline } from "@/lib/security/pipeline";
import { handleApiError, badRequest } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Extended schema to include dynamic roles safely
const ExtendedSignupSchema = SignupSchema.extend({
  restaurantId: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const pipeline = await processSecurityPipeline(req, {
      requireCsrf: true,
      rateLimit: { key: "signup", limit: 5, windowMs: 3600000 }, // 5 per hour
      schema: ExtendedSignupSchema,
    });
    
    if (!pipeline.success) return pipeline.response;

    const { fullName, email, password, restaurantId, role: requestedRole } = pipeline.sanitizedBody;

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
    const roles = [assignedRole] as ("owner" | "manager" | "staff" | "kitchen" | "customer" | "superadmin")[];

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
