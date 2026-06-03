/**
 * Centralized registry of all real-time events to prevent typos across backend/frontend.
 */
export const REALTIME_EVENTS = {
  // Order Events
  ORDER_CREATED: "order_created",
  ORDER_UPDATED: "order_updated",
  ORDER_STATUS_CHANGED: "order_status_changed",
  
  // Table & Session Events
  TABLE_STATUS_CHANGED: "table_status_changed",
  SESSION_STARTED: "session_started",
  SESSION_JOINED: "session_joined",
  SESSION_CLOSED: "session_closed",
  SESSION_COMPLETED: "session_completed",

  // Billing Events
  BILL_REQUESTED: "bill_requested",
  BILL_GENERATED: "bill_generated",
  BILL_PAID: "bill_paid",

  // Menu & Cart
  MENU_ITEM_UPDATED: "menu_item_updated",
  MENU_ITEM_UNAVAILABLE: "menu_item_unavailable",
  CATEGORY_UPDATED: "category_updated",
  CART_UPDATED: "cart_updated",
  CART_ITEM_ADDED: "cart_item_added",
  CART_ITEM_REMOVED: "cart_item_removed",
  CART_CLEARED: "cart_cleared",

  // Operational & Metrics
  KITCHEN_QUEUE_UPDATED: "kitchen_queue_updated",
  OWNER_REVENUE_UPDATED: "owner_revenue_updated",
  DASHBOARD_METRICS_UPDATED: "dashboard_metrics_updated",
  EMERGENCY_PAUSE: "emergency_pause",

  // Notifications
  STAFF_NOTIFICATION: "staff_notification",
  MANAGER_NOTIFICATION: "manager_notification",
  OWNER_NOTIFICATION: "owner_notification",
} as const;

export type RealtimeEventType = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];
