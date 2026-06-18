import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb/db";
import QRCodeModel from "@/models/QRCode";
import TableModel from "@/models/Table";
import RestaurantModel from "@/models/Restaurant";
import crypto from "crypto";
import QRCode from "qrcode";

const generateSchema = z.object({
  restaurantId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid restaurantId",
  }),
  tableId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid tableId",
  }),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { restaurantId, tableId } = result.data;

    // Validate Restaurant
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
    }

    // Validate Table Ownership
    const table = await TableModel.findOne({ _id: tableId, restaurantId });
    if (!table) {
      return NextResponse.json(
        { success: false, message: "Table not found or does not belong to this restaurant" },
        { status: 404 }
      );
    }

    // Prevent duplicate QR generation
    const existingQR = await QRCodeModel.findOne({ tableId, active: true });
    if (existingQR) {
      return NextResponse.json(
        { success: false, message: "Table already has an active QR code", data: existingQR },
        { status: 400 }
      );
    }

    // Generate unique code (8 characters)
    const uniqueCode = crypto.randomBytes(4).toString("hex");

    // Generate scan URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const scanUrl = `${baseUrl}/scan/${uniqueCode}`;

    // Generate PNG QR image (Base64 data URI)
    const qrImageBase64 = await QRCode.toDataURL(scanUrl, {
      margin: 2,
      scale: 15, // Using scale instead of width prevents sub-pixel rendering artifacts (the vertical split bug)
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Create QRCode document
    const newQR = await QRCodeModel.create({
      restaurantId,
      tableId,
      code: uniqueCode,
      qrImage: qrImageBase64,
      type: "table",
      active: true,
    });

    // Link QR to Table
    table.qrCodeId = newQR._id;
    await table.save();

    return NextResponse.json(
      {
        success: true,
        message: "QR code generated successfully",
        data: {
          code: newQR.code,
          qrImage: newQR.qrImage,
          scanUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Generate QR Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR code", error: error.message },
      { status: 500 }
    );
  }
}
