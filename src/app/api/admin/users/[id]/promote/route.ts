import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    // In a real app, verify the caller is actually a superadmin via session/token
    
    const { id } = await params;
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.roles.includes("superadmin")) {
      user.roles.push("superadmin");
      await user.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to promote user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
