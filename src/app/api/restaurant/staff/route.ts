import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Session from "@/models/Session";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { pusherServer } from "@/lib/pusher/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      // Owners and managers can view all staff to edit roles
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    await connectToDatabase();

    // Find all users belonging to this restaurant (excluding customers and maybe the owner themselves?)
    const staff = await User.find({ 
      restaurantId, 
      roles: { $ne: "customer" },
      _id: { $ne: payload.userId } // Don't list the owner themselves
    }).select("fullName email roles role profileImage lastLogin createdAt");

    // Normalize on the fly to support old schema until fully migrated
    const normalizedStaff = staff.map(user => {
      const dbUser = user.toObject();
      let mergedRoles = dbUser.roles || [];
      if (mergedRoles.length === 0 && (dbUser as any).role) {
        mergedRoles = [(dbUser as any).role];
      }
      return {
        _id: dbUser._id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        roles: mergedRoles,
        profileImage: dbUser.profileImage,
        lastLogin: dbUser.lastLogin,
        createdAt: dbUser.createdAt
      };
    });

    return NextResponse.json({ staff: normalizedStaff }, { status: 200 });
  } catch (error) {
    console.error("Staff GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || (!payload.roles.includes("owner") && !payload.roles.includes("manager"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { userId, roles, action } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (action === "remove") {
      // Remove from restaurant
      await User.findByIdAndUpdate(userId, {
        $unset: { restaurantId: "" },
        $set: { roles: ["customer"] }
      });
      // Invalidate their active sessions to force a token refresh and demote them
      await Session.deleteMany({ userId });
      await pusherServer.trigger(`private-user-${userId}`, "role_updated", {});
      return NextResponse.json({ message: "Staff removed successfully" }, { status: 200 });
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: "Invalid roles" }, { status: 400 });
    }

    // Update roles and remove legacy 'role' field
    await User.findByIdAndUpdate(userId, { 
      $set: { roles },
      $unset: { role: "" }
    });

    return NextResponse.json({ message: "Staff roles updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Staff PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
