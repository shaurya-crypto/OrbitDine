import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "./lib/auth/jwt";
import { jwtVerify } from "jose";

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Security Headers Configuration
  const headers = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  // Apply strict security headers to all /admin and /api/admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; frame-src 'self' https://accounts.google.com; connect-src 'self' wss: https:;"
    );
  }

  // 2. Admin Route Protection
  // Only protect /admin/* and /api/admin/* 
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    
    // Exception for the passphrase gate verification API itself
    if (pathname === "/api/admin/verify-passphrase") {
      return response;
    }

    // Check passphrase cookie (Enterprise Access Verification)
    const adminPassphraseCookie = request.cookies.get("admin_access_granted")?.value;
    
    if (adminPassphraseCookie !== "true" && pathname !== "/admin") {
      // If no passphrase cookie and not on the gate page, redirect to the gate
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // If on the gate page (/admin) and they HAVE the passphrase cookie, check JWT to see if they can proceed
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // If they are on /admin and don't have a token, just let them stay on /admin to login
      if (pathname === "/admin") return response;
      
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify JWT using jose
      const { payload } = await jwtVerify(token, getJwtSecret());
      
      const roles = payload.roles as string[];
      
      if (!roles || !roles.includes("superadmin")) {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Forbidden: Superadmin access required" }, { status: 403 });
        }
        // Redirect non-superadmins back to standard dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // If user is superadmin and on /admin (gate page), push them directly to /admin/dashboard
      if (pathname === "/admin" && adminPassphraseCookie === "true") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

    } catch (error) {
      // Invalid or expired token
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized or token expired" }, { status: 401 });
      }
      if (pathname === "/admin") return response;
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If they are admin and authorized, let them proceed through
    return response;
  }

  // --- STANDARD NON-ADMIN ROUTING --- //

  // Allow static files, standard API routes, and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(.*)$/) ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload = token ? await verifyAccessToken(token) : null;

  if (!payload) {
    // Access token is invalid or expired. Check refresh token.
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      payload = await verifyRefreshToken(refreshToken);
    }
    
    if (!payload) {
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }
  }

  // Enforce email verification (optional constraint as requested by user)
  if (!payload.isVerified && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  const roles: string[] = payload.roles || (payload.role ? [payload.role] : []);

  // Check if owner needs onboarding
  if (roles.includes("owner") && !payload.restaurantId && !pathname.startsWith("/onboarding")) {
    // If they are an owner and don't have a restaurantId, force them to /onboarding
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Role-based access control for dashboard (cascading hierarchy)
  if (pathname.startsWith("/dashboard")) {
    // Define which dashboard areas each role can access (cascading permissions)
    const roleAccess: Record<string, string[]> = {
      superadmin: ["/dashboard/customer", "/dashboard/owner", "/dashboard/manager", "/dashboard/staff", "/dashboard/kitchen", "/dashboard/tables", "/dashboard/settings"],
      owner: ["/dashboard/owner", "/dashboard/manager", "/dashboard/staff", "/dashboard/kitchen", "/dashboard/settings", "/dashboard/tables"],
      manager: ["/dashboard/manager", "/dashboard/staff", "/dashboard/kitchen", "/dashboard/tables"],
      staff: ["/dashboard/staff", "/dashboard/tables"],
      kitchen: ["/dashboard/kitchen"],
      customer: ["/dashboard/customer"],
    };

    let allowedPaths: string[] = [];
    roles.forEach(r => {
      if (roleAccess[r]) allowedPaths.push(...roleAccess[r]);
    });
    
    const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

    if (!isAllowed) {
      // Redirect to their highest role home dashboard if they try to access an unauthorized area
      const highestRole = ["superadmin", "owner", "manager", "staff", "kitchen", "customer"].find(r => roles.includes(r)) || "customer";
      
      if (highestRole === "superadmin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      
      return NextResponse.redirect(new URL(`/dashboard/${highestRole}`, request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (publicPaths.includes(pathname)) {
    if (roles.includes("superadmin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (roles.includes("owner") && !payload.restaurantId) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => roles.includes(r)) || "customer";
    return NextResponse.redirect(new URL(`/dashboard/${highestRole}`, request.url));
  }

  return NextResponse.next();
}

// Configure matcher to run proxy only on specific paths to optimize edge execution
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
