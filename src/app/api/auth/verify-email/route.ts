import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import VerificationToken from "@/models/VerificationToken";
import User from "@/models/User";

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

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
