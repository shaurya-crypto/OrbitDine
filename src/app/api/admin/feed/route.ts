import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

// In-memory array of connected clients (Server-Sent Events)
// Note: In a true multi-instance deployment, you'd use Redis Pub/Sub, but for this scale
// an in-memory Set works perfectly for streaming to the single/few superadmins.
const clients = new Set<ReadableStreamDefaultController>();

// Utility to broadcast an event to all connected admin clients
export function broadcastAdminEvent(type: string, data: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch (e) {
      clients.delete(client);
    }
  });
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new TextEncoder().encode("fallback_secret");
  return new TextEncoder().encode(secret);
};

export async function GET(req: NextRequest) {
  // 1. Strict Security Validation (Even though middleware protects, defense in depth)
  const token = req.cookies.get("accessToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const roles = payload.roles as string[];
    if (!roles || !roles.includes("superadmin")) {
      return new Response("Forbidden", { status: 403 });
    }
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }

  // 2. Set up SSE Stream
  let controllerRef: ReadableStreamDefaultController | null = null;
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      clients.add(controller);

      // Send initial connection success message
      const initMessage = `event: connected\ndata: {"status":"active"}\n\n`;
      controller.enqueue(new TextEncoder().encode(initMessage));

      // Optional: Send a heartbeat every 30 seconds to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`));
        } catch (e) {
          clearInterval(interval);
          clients.delete(controller);
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clients.delete(controller);
      });
    },
    cancel() {
      if (controllerRef) clients.delete(controllerRef);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Prevents Nginx from buffering the SSE
    },
  });
}
