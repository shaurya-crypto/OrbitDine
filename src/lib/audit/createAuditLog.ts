import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";
import { logger } from "@/lib/logger";

interface AuditLogOptions {
  actorId: mongoose.Types.ObjectId | "system";
  actorRole: "owner" | "manager" | "admin" | "system";
  restaurantId?: mongoose.Types.ObjectId;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetType?: "Restaurant" | "User" | "Subscription" | "System" | "Warning" | "Report" | "Menu" | "Order" | "Review";
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}

export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    await AuditLog.create(options);
  } catch (error) {
    logger.error("Failed to create audit log:", error);
    // We intentionally don't throw to prevent breaking the main transaction flow,
    // but we log heavily. In a true highly-critical environment, you might
    // push to a secondary queue.
  }
}
