import Pusher from "pusher";

// We use process.env to ensure credentials are never hardcoded.
// For local development without credentials, this will instantiate, 
// but triggers will just fail gracefully (which we will handle).
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "mock-app-id",
  key: process.env.PUSHER_KEY || "mock-key",
  secret: process.env.PUSHER_SECRET || "mock-secret",
  cluster: process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});
