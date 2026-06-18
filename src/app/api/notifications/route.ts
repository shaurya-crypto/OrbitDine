import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Notification from "@/models/Notification";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const audience = url.searchParams.get("audience") || "user"; // user, restaurant, admin
    const restaurantId = url.searchParams.get("restaurantId");

    let query: any = {
      $or: [
        { audience: "broadcast" }
      ]
    };

    if (audience === "user") {
      query.$or.push({ recipientId: decoded.userId });
    } else if (audience === "restaurant" && restaurantId) {
      query.$or.push({ restaurantId: restaurantId });
    } else if (audience === "admin" && decoded.roles.includes("superadmin")) {
      query.$or.push({ audience: "admin" });
    }

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { notificationId, action } = body;

    if (action === "mark_read") {
      if (notificationId === "all") {
        // Mark all as read logic
        const query: any = { readAt: { $exists: false } };
        
        // Ensure they only mark their own notifications
        if (body.restaurantId) {
          query.restaurantId = body.restaurantId;
        } else {
          query.recipientId = decoded.userId;
        }

        await Notification.updateMany(query, { $set: { readAt: new Date() } });
        return NextResponse.json({ success: true });
      } else {
        const notif = await Notification.findById(notificationId);
        if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 });
        
        notif.readAt = new Date();
        await notif.save();
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
