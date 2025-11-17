// src/app/middleware/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define route access by role
const roleAccess = {
  "/Employee": ["Employee", "Manager", "Admin"],
  "/Manager": ["Manager", "Admin"],
  "/Admin": ["Admin"],
};

// Edge runtime
export const runtime = "edge";

export async function middleware(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Skip static files & API routes & auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/Auth/Login") ||
    pathname.startsWith("/Auth/SignUp") ||
    pathname.startsWith("/Auth/UnAuthorizedAccess")
  ) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req,
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  });

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(
      new URL(
        "/Auth/Login?message=Session expired, please login again",
        req.url
      )
    );
  }

  // Role-based access check
  for (const routePrefix in roleAccess) {
    if (pathname.startsWith(routePrefix)) {
      const allowedRoles = roleAccess[routePrefix];
      if (!allowedRoles.includes(token.role)) {
        return NextResponse.redirect(
          new URL(
            "/Auth/UnAuthorizedAccess?message=Unauthorized Access",
            req.url
          )
        );
      }
    }
  }

  return NextResponse.next();
}

// Apply to specific routes
export const config = {
  matcher: ["/Employee/:path*", "/Manager/:path*", "/Admin/:path*"],
};
