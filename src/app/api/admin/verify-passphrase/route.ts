import { NextResponse, NextRequest } from "next/server";

// Simple in-memory rate limiter (Note: resets on server restart/scale, use Redis for production)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

function constantTimeCompare(val1: string, val2: string): boolean {
  if (val1.length !== val2.length) return false;
  let result = 0;
  for (let i = 0; i < val1.length; i++) {
    result |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();

    // 1. Rate Limiting Check
    const rateData = rateLimitMap.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    
    // If penalty time expired, reset
    if (now > rateData.resetAt) {
      rateData.count = 0;
      rateData.resetAt = now + 15 * 60 * 1000;
    }

    // Block if more than 5 failed attempts
    if (rateData.count >= 5) {
      return NextResponse.json({ error: "Too many failed attempts. Try again later." }, { status: 429 });
    }

    const { passphrase } = await req.json();

    if (!passphrase) {
      return NextResponse.json({ error: "Passphrase required" }, { status: 400 });
    }

    const secret = process.env.ADMIN_SECRET_PASSPHRASE;
    if (!secret) {
      console.error("ADMIN_SECRET_PASSPHRASE is not set in environment variables.");
      return NextResponse.json({ error: "Internal server configuration error" }, { status: 500 });
    }

    // 2. Constant Time Comparison
    // We intentionally delay slightly to obscure processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const isMatch = constantTimeCompare(passphrase, secret);

    if (!isMatch) {
      // Increment failure count
      rateData.count += 1;
      rateLimitMap.set(ip, rateData);
      
      return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 });
    }

    // 3. Success - Set Gate Cookie
    // Reset rate limit on success
    rateLimitMap.delete(ip);

    const response = NextResponse.json({ success: true });
    
    response.cookies.set("admin_access_granted", "true", {
      httpOnly: true, // Crucial: prevents XSS reading
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Passphrase verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
