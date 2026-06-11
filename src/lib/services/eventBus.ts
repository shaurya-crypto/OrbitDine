import { pusherServer } from "@/lib/pusher/server";
import { REALTIME_EVENTS, RealtimeEventType } from "@/lib/constants/realtimeEvents";

export interface OrderEventPayload { orderId: string; restaurantId: string; tableId?: string; status: string; timestamp: Date; }
export interface TableStatusPayload { tableId: string; restaurantId: string; status: string; timestamp: Date; }
export interface BillRequestedPayload { sessionId: string; restaurantId: string; tableId: string; timestamp: Date; }
export interface SessionEventPayload { sessionId: string; restaurantId: string; tableId: string; timestamp: Date; }
export interface MenuItemEventPayload { menuItemId: string; restaurantId: string; categoryId?: string; timestamp: Date; }
export interface CategoryEventPayload { categoryId: string; restaurantId: string; timestamp: Date; }
export interface CartEventPayload { sessionId: string; restaurantId: string; tableId: string; timestamp: Date; }
export interface OperationalEventPayload { restaurantId: string; message: string; timestamp: Date; }

import OwnerSetting from "@/models/OwnerSetting";
import connectToDatabase from "@/lib/mongodb/db";

class EventBus {
  private settingsCache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 60 * 1000; // 1 minute

  private async getSettings(restaurantId: string) {
    const now = Date.now();
    const cached = this.settingsCache.get(restaurantId);
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      await connectToDatabase();
      const settings = await OwnerSetting.findOne({ restaurantId }).lean();
      this.settingsCache.set(restaurantId, { data: settings, timestamp: now });
      return settings;
    } catch (error) {
      console.error("Failed to fetch OwnerSettings:", error);
      return null;
    }
  }

  /**
   * Helper to broadcast dynamically based on owner settings.
   */
  private async broadcastDynamically(
    restaurantId: string, 
    routingKey: "orderCreated" | "orderStatusChanged" | "billRequested" | "emergency", 
    eventName: RealtimeEventType, 
    payload: any,
    fallbackRoles: string[]
  ) {
    const settings = await this.getSettings(restaurantId);
    
    if (settings && settings.globalNotificationsEnabled === false) {
      return; // Globally muted
    }

    const roles = settings?.routing?.[routingKey] || fallbackRoles;
    for (const role of roles) {
      await this.broadcast(`private-${role}-${restaurantId}`, eventName, payload);
    }
  }

  /**
   * Broadcasts an event to a specific Pusher private channel.
   * Includes audit logging.
   */
  async broadcast(channel: string, eventName: RealtimeEventType, data: any): Promise<void> {
    try {
      if (process.env.PUSHER_APP_ID && process.env.PUSHER_APP_ID !== "mock-app-id") {
        await pusherServer.trigger(channel, eventName, data);
      }
      
      // Audit log (in production this might go to DataDog or a DB collection)
      console.log(`[EventBus] 🚀 Broadcast [${eventName}] to [${channel}]`, { data });
    } catch (error) {
      console.error(`[EventBus] ❌ Failed to broadcast event [${eventName}] to [${channel}]`, error);
      // We swallow the error so that the API doesn't crash if Pusher is temporarily down.
    }
  }

  async emitOrderCreated(payload: OrderEventPayload) {
    await this.broadcastDynamically(
      payload.restaurantId,
      "orderCreated",
      REALTIME_EVENTS.ORDER_CREATED,
      payload,
      ["kitchen", "staff", "manager", "owner"]
    );
  }

  async emitOrderUpdated(payload: OrderEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.ORDER_UPDATED, payload);
  }

  async emitOrderStatusChanged(payload: OrderEventPayload) {
    await this.broadcastDynamically(
      payload.restaurantId,
      "orderStatusChanged",
      REALTIME_EVENTS.ORDER_STATUS_CHANGED,
      payload,
      ["kitchen", "staff", "manager", "owner", "customer"]
    );
  }

  async emitTableStatusChanged(payload: TableStatusPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.TABLE_STATUS_CHANGED, payload);
  }

  async emitBillRequested(payload: BillRequestedPayload) {
    await this.broadcastDynamically(
      payload.restaurantId,
      "billRequested",
      REALTIME_EVENTS.BILL_REQUESTED,
      payload,
      ["staff", "manager", "owner"]
    );
  }

  async emitBillGenerated(payload: BillRequestedPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.BILL_GENERATED, payload);
  }

  async emitBillPaid(payload: BillRequestedPayload) {
    await this.broadcast(`private-owner-${payload.restaurantId}`, REALTIME_EVENTS.BILL_PAID, payload);
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.BILL_PAID, payload);
  }

  async emitSessionStarted(payload: SessionEventPayload) {
    await this.broadcast(`private-staff-${payload.restaurantId}`, REALTIME_EVENTS.SESSION_STARTED, payload);
  }

  async emitSessionJoined(payload: SessionEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.SESSION_JOINED, payload);
  }

  async emitSessionClosed(payload: SessionEventPayload) {
    await this.broadcast(`private-manager-${payload.restaurantId}`, REALTIME_EVENTS.SESSION_CLOSED, payload);
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.SESSION_CLOSED, payload);
  }

  async emitSessionCompleted(payload: SessionEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.SESSION_COMPLETED, payload);
  }

  async emitMenuItemUpdated(payload: MenuItemEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.MENU_ITEM_UPDATED, payload);
  }

  async emitMenuItemUnavailable(payload: MenuItemEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.MENU_ITEM_UNAVAILABLE, payload);
  }

  async emitCategoryUpdated(payload: CategoryEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.CATEGORY_UPDATED, payload);
  }

  async emitCartUpdated(payload: CartEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.CART_UPDATED, payload);
  }

  async emitCartItemAdded(payload: CartEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.CART_ITEM_ADDED, payload);
  }

  async emitCartItemRemoved(payload: CartEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.CART_ITEM_REMOVED, payload);
  }

  async emitCartCleared(payload: CartEventPayload) {
    await this.broadcast(`private-restaurant-${payload.restaurantId}`, REALTIME_EVENTS.CART_CLEARED, payload);
  }

  async emitKitchenQueueUpdated(payload: OperationalEventPayload) {
    await this.broadcast(`private-kitchen-${payload.restaurantId}`, REALTIME_EVENTS.KITCHEN_QUEUE_UPDATED, payload);
  }

  async emitOwnerRevenueUpdated(payload: OperationalEventPayload) {
    await this.broadcast(`private-owner-${payload.restaurantId}`, REALTIME_EVENTS.OWNER_REVENUE_UPDATED, payload);
  }

  async emitStaffNotification(payload: OperationalEventPayload) {
    await this.broadcast(`private-staff-${payload.restaurantId}`, REALTIME_EVENTS.STAFF_NOTIFICATION, payload);
  }

  async emitManagerNotification(payload: OperationalEventPayload) {
    await this.broadcast(`private-manager-${payload.restaurantId}`, REALTIME_EVENTS.MANAGER_NOTIFICATION, payload);
  }

  async emitOwnerNotification(payload: OperationalEventPayload) {
    await this.broadcast(`private-owner-${payload.restaurantId}`, REALTIME_EVENTS.OWNER_NOTIFICATION, payload);
  }

  async emitEmergency(payload: any) {
    await this.broadcastDynamically(
      payload.restaurantId,
      "emergency",
      "TABLE_EMERGENCY" as any,
      payload,
      ["owner", "manager", "staff", "kitchen"]
    );
  }

  async emitStopSounds(restaurantId: string, message: string) {
    const channels = ["owner", "manager", "staff", "kitchen"].map(role => `private-${role}-${restaurantId}`);
    try {
      await pusherServer.trigger(channels, "STOP_SOUNDS", { message });
    } catch (error) {
      console.error("[EventBus] Failed to broadcast STOP_SOUNDS", error);
    }
  }
}

export const eventBus = new EventBus();
