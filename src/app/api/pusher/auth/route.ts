import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;
    
    // In a full production app, we would extract the JWT or Session cookie here
    // to verify the user actually holds the role they are trying to subscribe to.
    // For Phase C.1, we'll allow the subscription to succeed for our private channels.
    // E.g. channel looks like: private-kitchen-12345

    if (!socketId || !channel) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // Basic authorization check (mock logic for the environment)
    // We would enforce: if channel.includes('owner') and req.user.role !== 'owner' -> 403
    
    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    return NextResponse.json(authResponse);

  } catch (error: any) {
    console.error("Pusher Auth Error:", error);
    return new NextResponse("Forbidden", { status: 403 });
  }
}
