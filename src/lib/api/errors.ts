import { NextResponse } from "next/server";
import { logger } from "../logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Standardized API error response builder.
 * Never leaks raw Mongo/Node errors to the client.
 */
export function handleApiError(error: any, context?: string) {
  // If it's a known operational error we threw ourselves
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error(`[${context || "API"}] Operational Error:`, error);
    } else {
      logger.warn(`[${context || "API"}] Client Error:`, error.message);
    }
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  // Handle generic / unknown errors safely
  logger.error(`[${context || "API"}] Unhandled Exception:`, error);

  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

export function unauthorized(message = "Unauthorized access") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function badRequest(message = "Bad request", details?: any) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function tooManyRequests(message = "Too many requests. Please try again later.") {
  return NextResponse.json({ error: message }, { status: 429 });
}
