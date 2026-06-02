import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

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
