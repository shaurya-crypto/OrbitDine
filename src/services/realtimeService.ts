import { getPusherClient } from "@/lib/pusher/client";
import { QueryClient } from "@tanstack/react-query";

export type ConnectionState = "connected" | "reconnecting" | "offline";

class RealtimeService {
  private pusher = getPusherClient();
  private connectionState: ConnectionState = this.pusher ? "reconnecting" : "offline";
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private isNullProvider = !this.pusher;

  private queryClientRef: QueryClient | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (this.pusher) {
      this.pusher.connection.bind("connected", () => {
        this.updateState("connected");
        this.startHeartbeat();
        this.triggerFullSync(); // Recover missed events
      });
      this.pusher.connection.bind("unavailable", () => { this.updateState("offline"); this.stopHeartbeat(); });
      this.pusher.connection.bind("failed", () => { this.updateState("offline"); this.stopHeartbeat(); });
      this.pusher.connection.bind("disconnected", () => { this.updateState("offline"); this.stopHeartbeat(); });
      this.pusher.connection.bind("connecting", () => this.updateState("reconnecting"));
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      // Force a ping if connection is stale
      if (this.pusher?.connection.state !== "connected") {
        this.updateState("reconnecting");
        this.pusher?.connect();
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private triggerFullSync() {
    // If we just reconnected, invalidate all realtime queries to fetch missed data
    if (this.queryClientRef) {
      this.queryClientRef.invalidateQueries({ queryKey: ["realtimeOrders"] });
      this.queryClientRef.invalidateQueries({ queryKey: ["realtimeTables"] });
      this.queryClientRef.invalidateQueries({ queryKey: ["realtimeSessions"] });
      this.queryClientRef.invalidateQueries({ queryKey: ["realtimeOverview"] });
    }
  }

  private updateState(newState: ConnectionState) {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      this.listeners.forEach((listener) => listener(newState));
    }
  }

  subscribeToState(listener: (state: ConnectionState) => void) {
    this.listeners.add(listener);
    listener(this.connectionState); // Send initial state
    return () => this.listeners.delete(listener);
  }

  getPollingInterval(eventGroup: "orders" | "tables" | "sessions" | "overview"): number | false {
    // If WebSockets are connected, turn off polling!
    if (this.connectionState === "connected") {
      return false;
    }
    // Auto-fallback: If offline, reconnecting, or missing keys, use 3s polling
    return 3000;
  }

  /**
   * Subscribes to necessary channels based on role and maps events to Query Invalidation.
   * Ensures Zero UI component changes!
   */
  bindDashboardEvents(restaurantId: string, role: string, queryClient: QueryClient) {
    this.queryClientRef = queryClient;
    if (!this.pusher) return; // Null provider mode, polling will take over

    // 1. Everyone listens to the main restaurant channel
    const restaurantChannel = this.pusher.subscribe(`private-restaurant-${restaurantId}`);
    
    const invalidate = (keys: string[]) => {
      queryClient.invalidateQueries({ queryKey: keys });
    };

    restaurantChannel.bind("order_created", () => invalidate(["realtimeOrders"]));
    restaurantChannel.bind("order_updated", () => invalidate(["realtimeOrders"]));
    restaurantChannel.bind("table_status_changed", () => invalidate(["realtimeTables"]));
    restaurantChannel.bind("menu_item_updated", () => invalidate(["menu", restaurantId]));

    // 2. Role specific bindings
    if (role === "kitchen" || role === "manager" || role === "owner") {
      const kitchenChannel = this.pusher.subscribe(`private-kitchen-${restaurantId}`);
      kitchenChannel.bind("kitchen_queue_updated", () => invalidate(["realtimeOrders"]));
      kitchenChannel.bind("order_created", () => invalidate(["realtimeOrders"]));
    }

    if (role === "staff" || role === "manager" || role === "owner") {
      const staffChannel = this.pusher.subscribe(`private-staff-${restaurantId}`);
      staffChannel.bind("bill_requested", () => invalidate(["realtimeSessions", "realtimeTables"]));
    }

    if (role === "owner") {
      const ownerChannel = this.pusher.subscribe(`private-owner-${restaurantId}`);
      ownerChannel.bind("owner_revenue_updated", () => invalidate(["realtimeOverview"]));
      ownerChannel.bind("bill_paid", () => invalidate(["realtimeOverview"]));
    }
  }

  bindUserEvents(userId: string, onRoleUpdated: () => void) {
    if (!this.pusher) return;
    const userChannel = this.pusher.subscribe(`private-user-${userId}`);
    userChannel.bind("role_updated", () => onRoleUpdated());
  }

  unbindUserEvents(userId: string) {
    if (!this.pusher) return;
    this.pusher.unsubscribe(`private-user-${userId}`);
  }

  unbindDashboardEvents(restaurantId: string, role: string) {
    if (!this.pusher) return;
    this.pusher.unsubscribe(`private-restaurant-${restaurantId}`);
    if (role === "kitchen" || role === "manager" || role === "owner") this.pusher.unsubscribe(`private-kitchen-${restaurantId}`);
    if (role === "staff" || role === "manager" || role === "owner") this.pusher.unsubscribe(`private-staff-${restaurantId}`);
    if (role === "owner") this.pusher.unsubscribe(`private-owner-${restaurantId}`);
  }
}

export const realtimeService = new RealtimeService();
