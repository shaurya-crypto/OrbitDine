import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth/jwt";

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api auth routes, and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.match(/\.(.*)$/) ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    const payload = await verifyAccessToken(token);

    if (!payload) {
      // Token is invalid or expired
      if (pathname.startsWith("/dashboard")) {
        // We could theoretically try to refresh here, but standard practice in Edge is to let 
        // the client intercept the 401 on API calls and do a refresh, or redirect to login.
        // For simplicity in proxy, we redirect to login if access token is invalid.
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    // Enforce email verification (optional constraint as requested by user)
    if (!payload.isVerified && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // Role-based access control for dashboard (cascading hierarchy)
    if (pathname.startsWith("/dashboard")) {
      const roles: string[] = payload.roles || (payload.role ? [payload.role] : []);
      
      // Define which dashboard areas each role can access (cascading permissions)
      const roleAccess: Record<string, string[]> = {
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
        const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => roles.includes(r)) || "customer";
        return NextResponse.redirect(new URL(`/dashboard/${highestRole}`, request.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (publicPaths.includes(pathname)) {
      const roles: string[] = payload.roles || (payload.role ? [payload.role] : []);
      const highestRole = ["owner", "manager", "staff", "kitchen", "customer"].find(r => roles.includes(r)) || "customer";
      return NextResponse.redirect(new URL(`/dashboard/${highestRole}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
