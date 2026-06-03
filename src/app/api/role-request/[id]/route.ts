import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/db";
import RoleRequest from "@/models/RoleRequest";
import User from "@/models/User";

// PATCH: Approve or Reject a role request
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { action } = await req.json(); // "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const roleRequest = await RoleRequest.findById(id);
    if (!roleRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (roleRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    roleRequest.status = action === "approve" ? "approved" : "rejected";
    await roleRequest.save();

    if (action === "approve") {
      // Update the user's role
      await User.findByIdAndUpdate(roleRequest.userId, {
        role: roleRequest.requestedRole,
      });
    }

    // TODO: Send email to user notifying them of approval/rejection

    return NextResponse.json({ message: `Request ${action}d successfully` }, { status: 200 });
  } catch (error) {
    console.error("RoleRequest PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
