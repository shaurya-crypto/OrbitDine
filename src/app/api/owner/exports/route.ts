import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb/db";
import { createAuditLog } from "@/lib/audit/createAuditLog";
import { stringify } from "csv-stringify/sync";
import Restaurant from "@/models/Restaurant";
import Order from "@/models/Order";
import Review from "@/models/Review";
import MenuItem from "@/models/MenuItem";
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
    const roles = payload.roles as string[];
    
    if (!roles.includes("owner") && !roles.includes("manager")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // orders, reviews, menu
    const format = searchParams.get("format"); // csv, json
    let restaurantId = searchParams.get("restaurantId");

    if (!type || !format || !restaurantId) {
      return new NextResponse("Missing type, format, or restaurantId", { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return new NextResponse("Restaurant not found", { status: 404 });
    }

    // Allow owners of the restaurant, or managers (assuming they are validated here, for now strictly checking ownerId if owner)
    if (roles.includes("owner") && restaurant.ownerId.toString() !== payload.userId) {
      // In a real app we would check manager assignments too, but for simplicity we rely on standard ownership check
      return new NextResponse("Forbidden", { status: 403 });
    }

    let Model: any;
    let dataMapper = (doc: any) => doc;
    let query: any = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };

    switch (type) {
      case "orders":
        Model = Order;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          OrderNumber: doc.orderNumber,
          Status: doc.status,
          Subtotal: doc.subtotal,
          Tax: doc.tax,
          GrandTotal: doc.grandTotal,
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      case "reviews":
        Model = Review;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          Rating: doc.rating,
          FoodRating: doc.foodRating || "",
          ServiceRating: doc.serviceRating || "",
          Feedback: doc.feedback || "",
          ModerationStatus: doc.moderationStatus,
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      case "menu":
        Model = MenuItem;
        dataMapper = (doc: any) => ({
          ID: doc._id.toString(),
          Name: doc.name,
          Price: doc.price,
          Available: doc.available ? "Yes" : "No",
          Veg: doc.veg ? "Yes" : "No",
          CreatedAt: doc.createdAt?.toISOString() || "",
        });
        break;
      default:
        return new NextResponse("Invalid export type", { status: 400 });
    }

    // 1. Audit the Export action
    await createAuditLog({
      actorId: new mongoose.Types.ObjectId(payload.userId as string),
      actorRole: roles.includes("owner") ? "owner" : "manager",
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      action: "EXPORT_DATA",
      targetType: "Restaurant",
      targetId: new mongoose.Types.ObjectId(restaurantId),
      reason: `Exported ${type} in ${format} format`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      afterState: { type, format }
    });

    // 2. Setup the Web Stream
    const cursor = Model.find(query).lean().cursor();
    let isFirstRow = true;

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const doc = await cursor.next();
          if (!doc) {
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
      headers.set("Content-Disposition", `attachment; filename="${restaurant.slug}_${type}_export.csv"`);
    } else {
      headers.set("Content-Type", "application/json");
      headers.set("Content-Disposition", `attachment; filename="${restaurant.slug}_${type}_export.json"`);
    }

    return new NextResponse(stream, { headers });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
