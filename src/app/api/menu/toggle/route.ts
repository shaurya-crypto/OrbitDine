import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb/db";
import MenuItemModel from "@/models/MenuItem";
import { eventBus } from "@/lib/services/eventBus";

const toggleSchema = z.object({
  menuItemId: z.string(),
  isAvailable: z.boolean(),
});

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = toggleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { menuItemId, isAvailable } = result.data;

    const updatedItem = await MenuItemModel.findByIdAndUpdate(
      menuItemId,
      { isAvailable },
      { new: true }
    ).lean();

    if (!updatedItem) {
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 });
    }

    // Trigger realtime event so frontend menus update instantly
    eventBus.emitMenuItemUpdated({
      restaurantId: updatedItem.restaurantId.toString(),
      menuItemId: updatedItem._id.toString(),
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Menu Toggle Error:", error);
    return NextResponse.json({ success: false, message: "Failed to toggle menu item", error: error.message }, { status: 500 });
  }
}
