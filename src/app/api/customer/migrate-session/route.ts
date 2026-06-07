import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import OrderSession from "@/models/OrderSession";
import User from "@/models/User";
import Review from "@/models/Review";
import Bill from "@/models/Bill";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const token = req.headers.get("cookie")?.split("; ").find(r => r.startsWith("accessToken="))?.split("=")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Session ID required" }, { status: 400 });

    await connectToDatabase();

    // 2. Find the dining session
    // sessionId from the client is usually a string (short ID), but let's check if it's the _id or a short sessionId.
    // In OrderSession, wait, the client passes `sessionId`. In earlier phases, `sessionId` was a short ID or the actual _id?
    // Let's assume it's the `_id` of the OrderSession because that's standard.
    const session = await OrderSession.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Prevent duplicate linking or stealing sessions
    if (session.userId) {
      if (session.userId.toString() === decoded.userId) {
        return NextResponse.json({ message: "Session already linked" }, { status: 200 });
      }
      return NextResponse.json({ error: "Session is already linked to another account" }, { status: 403 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 3. Link session
    session.userId = user._id;
    await session.save();

    // 4. Link reviews
    await Review.updateMany(
      { sessionId: session._id },
      { $set: { customerId: user._id } }
    );

    // 5. Link Bill
    const bill = await Bill.findOne({ sessionId: session._id });
    let sessionSpend = 0;
    if (bill) {
      bill.customerId = user._id;
      await bill.save();
      sessionSpend = bill.grandTotal;
    }

    // 6. Update User aggregates
    if (!user.savedRestaurants) user.savedRestaurants = [];
    if (!user.favoriteItems) user.favoriteItems = [];

    // Add restaurant to saved if not present
    if (!user.savedRestaurants.includes(session.restaurantId)) {
      user.savedRestaurants.push(session.restaurantId);
    }

    // Add items from this order to favorite items if not present
    const itemIds = session.cart.map((i: any) => i.menuItemId);
    itemIds.forEach((id: any) => {
      if (!user.favoriteItems.includes(id)) {
        user.favoriteItems.push(id);
      }
    });

    user.totalOrders = (user.totalOrders || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + sessionSpend;
    
    await user.save();

    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
