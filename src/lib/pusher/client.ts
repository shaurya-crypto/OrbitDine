import Pusher from "pusher-js";

// Ensure Pusher logs only in development for debugging
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  Pusher.logToConsole = false; 
}

let pusherInstance: Pusher | null = null;

export const getPusherClient = (): Pusher | null => {
  if (typeof window === "undefined") return null; // Prevent SSR crash
  if (pusherInstance) return pusherInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  // Null Realtime Provider fallback for local dev without keys
  if (!key || key === "your_key" || !cluster) {
    console.warn("Pusher credentials not found. Falling back to NullRealtimeProvider mode.");
    return null;
  }

  pusherInstance = new Pusher(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
  });

  return pusherInstance;
};
