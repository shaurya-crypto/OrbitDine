type RateLimitEntry = {
  count: number;
  resetAt: number;
};

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();

  /**
   * Checks if a key has exceeded the limit.
   * @param key Unique identifier (e.g. IP + endpoint)
   * @param limit Max requests per window
   * @param windowMs Window duration in milliseconds
   * @returns { success: boolean, remaining: number, resetAt: number }
   */
  public check(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    let entry = this.cache.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new window
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.cache.set(key, entry);
      return { success: true, remaining: limit - 1, resetAt: entry.resetAt };
    }

    // Increment existing window
    entry.count += 1;
    this.cache.set(key, entry);

    if (entry.count > limit) {
      return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  // Optional: call this periodically if you want to avoid memory leaks over long-running instances
  public cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.resetAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Start a cleanup interval to prevent memory leaks in the singleton
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60000).unref?.();
}
