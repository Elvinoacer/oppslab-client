// =============================================================================
// Next.js 16 Proxy (Route Protection Layer)
// =============================================================================
// This file serves as the network boundary for request interception.
// It handles authentication redirects and role-based access control.
// =============================================================================

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req: { auth?: any; nextUrl?: any; }) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Define route categories
  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");

  // Protected routes require authentication
  const isProtectedRoute = isAdminRoute || isDashboardRoute;

  // Handle unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Handle admin routes - check for admin role
  if (isAdminRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role;
    if (userRole !== "ADMIN" && userRole !== "CURATOR") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    // Respect callbackUrl if present (e.g. /auth/signin?callbackUrl=/dashboard/saved)
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");
    const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/dashboard";
    return NextResponse.redirect(new URL(destination, nextUrl));
  }

  return NextResponse.next();
});

// Matcher configuration - exclude static assets, images, and API routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (let them handle their own auth)
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
