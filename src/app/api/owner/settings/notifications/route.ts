import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import OwnerSetting from "@/models/OwnerSetting";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.roles.includes("owner")) {
      return NextResponse.json({ error: "Unauthorized. Owner access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    await connectToDatabase();
    
    // Find or create default settings
    let settings = await OwnerSetting.findOne({ restaurantId, ownerId: payload.userId });
    
    if (!settings) {
      settings = await OwnerSetting.create({
        restaurantId,
        ownerId: payload.userId,
        globalNotificationsEnabled: true,
        kitchenCanCancelOrder: false,
        routing: {
          orderCreated: ["kitchen", "staff", "manager", "owner"],
          orderStatusChanged: ["kitchen", "staff", "manager", "owner"],
          billRequested: ["staff", "manager", "owner"],
          foodReminder: ["kitchen", "staff", "manager", "owner"],
          serveReminder: ["staff", "manager", "owner"],
          emergency: ["owner", "manager", "staff", "kitchen"],
        }
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("OwnerSettings GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.roles.includes("owner")) {
      return NextResponse.json({ error: "Unauthorized. Owner access required." }, { status: 401 });
    }

    const body = await req.json();
    const { restaurantId, globalNotificationsEnabled, kitchenCanCancelOrder, routing } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    await connectToDatabase();
    
    const settings = await OwnerSetting.findOneAndUpdate(
      { restaurantId, ownerId: payload.userId },
      { 
        globalNotificationsEnabled,
        kitchenCanCancelOrder,
        routing
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Settings updated successfully", settings }, { status: 200 });
  } catch (error) {
    console.error("OwnerSettings PUT Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
