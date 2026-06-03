import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import RoleRequest from "@/models/RoleRequest";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import mongoose from "mongoose";

// POST: Create a new role request (Customer/Staff requesting upgrade)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { userId, restaurantId, requestedRole } = await req.json();

    if (!userId || !restaurantId || !requestedRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ 
        error: "Legacy session detected. Your session uses old dummy credentials. Please log out from the sidebar and create a new account to use this feature." 
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if request already exists
    const existing = await RoleRequest.findOne({ userId, restaurantId, status: "pending" });
    if (existing) {
      return NextResponse.json({ error: "You already have a pending role request." }, { status: 400 });
    }

    const roleRequest = await RoleRequest.create({
      userId,
      restaurantId,
      requestedRole,
    });

    // TODO: Phase C.2 - Send email to Owner via Brevo

    return NextResponse.json({ message: "Role request submitted successfully", roleRequest }, { status: 201 });
  } catch (error) {
    console.error("RoleRequest POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch pending role requests for a restaurant (for Owner dashboard)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const requests = await RoleRequest.find({ restaurantId, status: "pending" })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("RoleRequest GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
