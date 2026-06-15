import { headers } from "next/headers";
import { logger } from "../logger";

export async function validateCSRF(): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");
  const host = headersList.get("host");

  if (!origin && !referer) {
    // Some strict environments might block requests without origin/referer.
    // For a generic web app, if both are missing on a POST, it's highly suspicious.
    logger.warn("CSRF Warning: Missing Origin and Referer");
    return false;
  }

  // Check if origin matches host
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      // In dev, host might be localhost:3000, origin http://localhost:3000
      if (originUrl.host !== host) {
        logger.warn(`CSRF Warning: Origin mismatch. Origin: ${origin}, Host: ${host}`);
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  // Check if referer matches host
  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        logger.warn(`CSRF Warning: Referer mismatch. Referer: ${referer}, Host: ${host}`);
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  return true;
}
