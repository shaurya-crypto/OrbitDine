import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth/jwt";

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

// Paths that require specific roles
const rolePaths: Record<string, string[]> = {
  owner: ["/dashboard/owner", "/dashboard/settings"],
  manager: ["/dashboard/manager"],
  staff: ["/dashboard/staff"],
  customer: ["/dashboard/customer"],
};

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

    // Role-based access control for dashboard
    if (pathname.startsWith("/dashboard")) {
      const role = payload.role;
      const isAllowed = Object.entries(rolePaths).some(([allowedRole, paths]) => {
        return role === allowedRole && paths.some((p) => pathname.startsWith(p));
      });

      if (!isAllowed) {
        // Redirect to their respective dashboard if they try to access another role's path
        return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
