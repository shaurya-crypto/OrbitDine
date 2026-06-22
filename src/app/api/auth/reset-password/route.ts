import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import { processSecurityPipeline } from "@/lib/security/pipeline";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(req: NextRequest) {
  try {
    const pipeline = await processSecurityPipeline(req, {
      requireCsrf: true,
      rateLimit: { key: "reset_password", limit: 3, windowMs: 900000 }, // 3 per 15 min
      schema: ResetPasswordSchema,
    });

    if (!pipeline.success) return pipeline.response;

    const { token, newPassword } = pipeline.sanitizedBody;

    await connectToDatabase();

    const resetToken = await PasswordResetToken.findOne({
      token,
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook will hash it

    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
