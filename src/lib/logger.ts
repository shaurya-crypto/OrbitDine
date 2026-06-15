type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    // In production, this could send to Datadog/Axiom/Sentry
    const timestamp = new Date().toISOString();
    
    // Mask sensitive fields if they happen to sneak into meta
    const safeMeta = this.maskSensitiveData(meta);

    const logEntry = {
      timestamp,
      level,
      message,
      ...(safeMeta ? { meta: safeMeta } : {}),
    };

    if (process.env.NODE_ENV !== "production") {
      // Pretty print in dev
      if (level === "error") {
        console.error(`[${timestamp}] ERROR: ${message}`, safeMeta || "");
      } else if (level === "warn") {
        console.warn(`[${timestamp}] WARN: ${message}`, safeMeta || "");
      } else {
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, safeMeta || "");
      }
    } else {
      // Structured JSON in production for ingestion
      console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(logEntry));
    }
  }

  public info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  public warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  public error(message: string, meta?: any) {
    // If meta is an Error object, extract stack
    if (meta instanceof Error) {
      this.log("error", message, { name: meta.name, message: meta.message, stack: meta.stack });
    } else {
      this.log("error", message, meta);
    }
  }

  public debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    // Simple deep clone and mask
    try {
      const clone = JSON.parse(JSON.stringify(data));
      const sensitiveKeys = ["password", "token", "accessToken", "refreshToken", "secret", "cvv", "creditCard"];
      
      const maskObject = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        for (const key in obj) {
          if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            obj[key] = "[REDACTED]";
          } else if (typeof obj[key] === "object") {
            maskObject(obj[key]);
          }
        }
      };

      maskObject(clone);
      return clone;
    } catch (e) {
      return data; // Fallback if not serializable
    }
  }
}

export const logger = new Logger();
