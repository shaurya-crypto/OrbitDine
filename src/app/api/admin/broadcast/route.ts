import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import PlatformNotification from "@/models/PlatformNotification";
import AuditLog from "@/models/AuditLog";
import { jwtVerify } from "jose";
import { broadcastAdminEvent } from "../feed/route"; // the SSE broadcaster

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new TextEncoder().encode("fallback_secret");
  return new TextEncoder().encode(secret);
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload: any;
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      payload = verified.payload;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!payload.roles.includes("superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, message, type, targetAudience } = await req.json();

    if (!title || !message || !type || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Create the persistent notification
    const notification = await PlatformNotification.create({
      title,
      message,
      type,
      targetAudience,
      createdBy: payload.userId,
    });

    // 2. Audit the action
    await AuditLog.create({
      adminId: payload.userId,
      action: "SEND_BROADCAST",
      targetType: "System",
      reason: `Broadcasted ${type} message to ${targetAudience}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      afterState: { title, type, targetAudience }
    });

    // 3. Dispatch to live SSE connections (Admins see it instantly)
    // If we wanted to push to customers, we'd need to emit to Pusher here.
    broadcastAdminEvent("critical_alert", {
      title,
      message: `${type.toUpperCase()}: ${title} - ${message}`,
      targetAudience
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
