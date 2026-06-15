import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, masterKey } = await req.json();

    if (!email || !masterKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Compare with env variable MASTER_SETUP_KEY
    const envMasterKey = process.env.MASTER_SETUP_KEY;
    
    if (!envMasterKey || masterKey !== envMasterKey) {
      // Intentionally ambiguous error to prevent brute forcing
      return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.roles.includes("superadmin")) {
      return NextResponse.json({ message: "User is already a superadmin" });
    }

    user.roles.push("superadmin");
    await user.save();

    return NextResponse.json({ 
      message: "Successfully promoted user to superadmin",
      roles: user.roles
    });

  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
