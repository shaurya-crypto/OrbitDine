import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Session from "@/models/Session";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { sendStaffTransferNotificationEmail } from "@/lib/services/email.service";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { restaurantId, role } = await req.json();

    if (!restaurantId || !role) {
      return NextResponse.json({ error: "Missing restaurantId or role" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetRestaurant = await Restaurant.findById(restaurantId);
    if (!targetRestaurant) {
      return NextResponse.json({ error: "Target restaurant not found" }, { status: 404 });
    }

    // Check if user is currently staff at ANOTHER restaurant
    if (user.restaurantId && user.restaurantId.toString() !== restaurantId.toString()) {
      // Find old restaurant and owner to send notification
      const oldRestaurant = await Restaurant.findById(user.restaurantId);
      if (oldRestaurant && oldRestaurant.ownerId) {
        const oldOwner = await User.findById(oldRestaurant.ownerId);
        if (oldOwner && oldOwner.email) {
          // Send transfer notification email
          await sendStaffTransferNotificationEmail(
            oldOwner.email,
            oldOwner.fullName || "Owner",
            user.fullName || "A staff member",
            targetRestaurant.name
          );
        }
      }
    }

    // Assign to new restaurant
    user.restaurantId = targetRestaurant._id;
    user.roles = [role];
    (user as any).role = undefined; // clear legacy role field
    await user.save();

    // Invalidate active sessions to force a new token with updated roles/restaurantId
    await Session.deleteMany({ userId: user._id });

    // Optional: could set a new cookie here or let the client re-login
    // We will let the client handle it, or we could generate a new token
    // For simplicity, we just return success, client should fetch new token or log in again
    // But generating a new token is better UX
    const { signAccessToken } = await import("@/lib/auth/jwt");
    const newPayload = {
      userId: user._id.toString(),
      roles: user.roles,
      isVerified: user.isVerified,
      restaurantId: user.restaurantId.toString(),
    };
    const newAccessToken = await signAccessToken(newPayload);

    const response = NextResponse.json({ 
      success: true, 
      message: "Successfully joined restaurant",
      redirectUrl: `/dashboard/${role}` 
    }, { status: 200 });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Staff Join Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
