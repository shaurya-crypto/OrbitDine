import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb/db";
import { createAuditLog } from "@/lib/audit/createAuditLog";
import { stringify } from "csv-stringify/sync";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new TextEncoder().encode("fallback_secret");
  return new TextEncoder().encode(secret);
};

export const maxDuration = 300; // 5 minutes max duration for large exports
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.roles || !(payload.roles as string[]).includes("superadmin")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // restaurants, users, orders, audit-logs
    const format = searchParams.get("format"); // csv, json

    if (!type || !format) {
      return new NextResponse("Missing type or format", { status: 400 });
    }

    await connectToDatabase();

    let Model: any;
    let dataMapper = (doc: any) => doc;

    switch (type) {
      case "restaurants":
        Model = Restaurant;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          Name: doc.name,
          City: doc.city || "",
          Status: doc.status,
          TotalTables: doc.totalTables || 0,
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      case "users":
        Model = User;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          Name: doc.fullName,
          Email: doc.email,
          Roles: doc.roles?.join(", ") || "",
          IsVerified: doc.isVerified ? "Yes" : "No",
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      case "orders":
        Model = Order;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          OrderNumber: doc.orderNumber,
          RestaurantID: doc.restaurantId?.toString() || "",
          Status: doc.status,
          GrandTotal: doc.grandTotal,
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      case "audit-logs":
        Model = AuditLog;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          ActorID: doc.actorId?.toString() || "",
          ActorRole: doc.actorRole || "",
          Action: doc.action,
          TargetType: doc.targetType || "",
          Reason: doc.reason || "",
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      default:
        return new NextResponse("Invalid export type", { status: 400 });
    }

    // 1. Audit the Export action
    await createAuditLog({
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: "admin",
      action: "EXPORT_DATA",
      targetType: "System",
      reason: `Exported ${type} in ${format} format`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      afterState: { type, format }
    });

    // 2. Setup the Web Stream
    const cursor = Model.find().lean().cursor();
    let isFirstRow = true;

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const doc = await cursor.next();
          if (!doc) {
            // EOF
            if (format === "json") controller.enqueue(new TextEncoder().encode("\n]"));
            controller.close();
            return;
          }

          const maskedDoc = dataMapper(doc);

          if (format === "csv") {
            const csvRow = stringify([maskedDoc], { header: isFirstRow });
            controller.enqueue(new TextEncoder().encode(csvRow));
            isFirstRow = false;
          } else if (format === "json") {
            if (isFirstRow) {
              controller.enqueue(new TextEncoder().encode("[\n  " + JSON.stringify(maskedDoc)));
              isFirstRow = false;
            } else {
              controller.enqueue(new TextEncoder().encode(",\n  " + JSON.stringify(maskedDoc)));
            }
          }
        } catch (err) {
          console.error("Stream cursor error:", err);
          controller.error(err);
        }
      },
      cancel() {
        cursor.close();
      }
    });

    // 3. Return the response with appropriate headers
    const headers = new Headers();
    if (format === "csv") {
      headers.set("Content-Type", "text/csv");
      headers.set("Content-Disposition", `attachment; filename="${type}_export.csv"`);
    } else {
      headers.set("Content-Type", "application/json");
      headers.set("Content-Disposition", `attachment; filename="${type}_export.json"`);
    }

    return new NextResponse(stream, { headers });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
