import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import { createAuditLog } from "@/lib/audit/createAuditLog";
import { jwtVerify } from "jose";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new TextEncoder().encode("fallback_secret");
  return new TextEncoder().encode(secret);
};

async function getAdminSession(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as any;
  } catch (err) {
    return null;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    if (!adminSession || !adminSession.roles.includes("superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectToDatabase();

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const oldStatus = restaurant.status;
    restaurant.status = status;
    await restaurant.save();

    // Log the action immutably
    await createAuditLog({
      actorId: adminSession.userId,
      actorRole: "admin",
      action: "UPDATE_RESTAURANT_STATUS",
      targetId: restaurant._id,
      targetType: "Restaurant",
      reason: `Changed status from ${oldStatus} to ${status}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      beforeState: { status: oldStatus },
      afterState: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update status", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    if (!adminSession || !adminSession.roles.includes("superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectToDatabase();

    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await createAuditLog({
      actorId: adminSession.userId,
      actorRole: "admin",
      action: "DELETE_RESTAURANT",
      targetId: restaurant._id,
      targetType: "Restaurant",
      reason: "Permanent deletion via Admin panel",
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      beforeState: { name: restaurant.name, status: restaurant.status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
