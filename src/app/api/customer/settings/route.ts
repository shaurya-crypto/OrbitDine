import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import Session from "@/models/Session";
import VerificationToken from "@/models/VerificationToken";
import { verifyAccessToken } from "@/lib/auth/jwt";

// Helper to authenticate user
async function authenticate(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.userId || null;
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { fullName, phoneNumber, defaultCity, locationEnabled, profileImage } = body;

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (defaultCity !== undefined) user.defaultCity = defaultCity;
    if (locationEnabled !== undefined) user.locationEnabled = locationEnabled;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Fire analytics event
    const AnalyticsEvent = (await import("@/models/AnalyticsEvent")).default;
    await AnalyticsEvent.create({
      customerId: userId,
      eventType: "profile_update",
      metadata: { locationEnabled }
    }).catch(() => {});

    return NextResponse.json({ 
      message: "Settings updated successfully",
      profile: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        defaultCity: user.defaultCity,
        locationEnabled: user.locationEnabled,
        profileImage: user.profileImage
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Customer Settings PUT Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if the user is an owner of a restaurant
    // If they are, they shouldn't delete their account without deleting the restaurant first.
    if (user.roles.includes("owner")) {
      const Restaurant = (await import("@/models/Restaurant")).default;
      const restaurant = await Restaurant.findOne({ ownerId: user._id });
      if (restaurant) {
        return NextResponse.json({ 
          error: "You must delete your restaurant from the Restaurant Settings before deleting your account." 
        }, { status: 400 });
      }
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    // Clean up sessions and verification tokens
    await Session.deleteMany({ userId });
    await VerificationToken.deleteMany({ userId });

    const response = NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    
    // Clear auth cookies
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    
    return response;

  } catch (error: any) {
    console.error("Customer Account DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
