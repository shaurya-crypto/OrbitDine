import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { sendRestaurantDeletedEmail } from "@/lib/services/email.service";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant, { status: 200 });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { 
      restaurantId, name, address, cuisineType, contactEmail, contactPhone,
      city, state, country, pinCode, restaurantType, openingHours, closingHours,
      latitude, longitude, logo
    } = await req.json();

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (cuisineType) updateData.cuisineType = cuisineType;
    if (contactEmail) updateData.email = contactEmail;
    if (contactPhone) updateData.phone = contactPhone;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (country) updateData.country = country;
    if (pinCode) updateData.pinCode = pinCode;
    if (restaurantType) updateData.restaurantType = restaurantType;
    if (openingHours) updateData.openingHours = openingHours;
    if (closingHours) updateData.closingHours = closingHours;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    
    // Always keep GeoJSON location in sync if coordinates are provided
    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
      };
    }

    if (logo) updateData.logo = logo;

    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updateData, { returnDocument: 'after' });
    
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Settings updated successfully", restaurant }, { status: 200 });
  } catch (error) {
    console.error("Settings PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (restaurant.ownerId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Only the owner can delete the restaurant" }, { status: 403 });
    }

    const owner = await User.findById(payload.userId);

    // Delete restaurant
    await Restaurant.deleteOne({ _id: restaurantId });

    // Clean up users' restaurantId references
    await User.updateMany(
      { restaurantId },
      { $unset: { restaurantId: "" }, $pull: { roles: { $in: ["manager", "staff", "kitchen"] } } }
    );

    if (owner && owner.email) {
      await sendRestaurantDeletedEmail(owner.email, owner.fullName, restaurant.name);
    }

    return NextResponse.json({ message: "Restaurant deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Settings DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
