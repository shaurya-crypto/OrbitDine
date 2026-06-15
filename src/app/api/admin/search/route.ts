import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Order from "@/models/Order";

// Only allow superadmins via middleware

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await connectToDatabase();

    // Use a regex for partial matching if no text index, or full text search
    // Since we want substring matches (e.g. phone numbers, partial emails, partial names)
    // we use regex. For massive production DBs, Atlas Search is required, but this works well.
    const regex = new RegExp(query, "i");

    const [restaurants, users, orders] = await Promise.all([
      Restaurant.find({
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { city: regex },
        ]
      }).limit(10).lean(),
      
      User.find({
        $or: [
          { fullName: regex },
          { email: regex },
          { phoneNumber: regex },
        ]
      }).limit(10).lean(),

      // For orders, we can search by orderId (which usually ends up being the string form of _id, but we'll try a regex if there's a custom displayId)
      // If we only have ObjectId, regex on _id is not supported. We skip order ID regex unless there's a specific orderNumber field.
      // Assuming Order doesn't have a string orderNumber yet, we'll just return empty for now, or match if query is exactly 24 hex chars.
      query.length === 24 ? Order.find({ _id: query }).limit(5).lean() : Promise.resolve([])
    ]);

    const results = [
      ...restaurants.map(r => ({
        id: r._id.toString(),
        type: "restaurant",
        title: r.name,
        subtitle: r.email || r.city || "No details",
        url: `/admin/restaurants/${r._id}`
      })),
      ...users.map(u => ({
        id: u._id.toString(),
        type: "user",
        title: u.fullName,
        subtitle: u.email || u.phoneNumber || "No details",
        url: `/admin/users/${u._id}`
      })),
      ...orders.map((o: any) => ({
        id: o._id.toString(),
        type: "order",
        title: `Order #${o._id.toString().slice(-6)}`,
        subtitle: `₹${o.totalAmount} - ${o.status}`,
        url: `/admin/orders/${o._id}`
      }))
    ];

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
