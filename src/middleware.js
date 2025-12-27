// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET; // same as in your nextauth route

// Define route-role mappings
const roleProtectedRoutes = [
  { path: "/admin", roles: ["Admin"] },
  { path: "/manager", roles: ["Manager"] },
  { path: "/employee", roles: ["Employee"] },
];

// Middleware function
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes (like login, api, _next)
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get JWT token from NextAuth
  const token = await getToken({ req, secret: AUTH_SECRET });

  // If no token → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const route of roleProtectedRoutes) {
    if (pathname.startsWith(route.path)) {
      if (!route.roles.includes(token.role)) {
        // Unauthorized access → redirect to dashboard based on role
        const redirectUrl = new URL(
          token.role === "Admin"
            ? "/admin/dashboard"
            : token.role === "Manager"
            ? "/manager/dashboard"
            : "/employee/dashboard",
          req.url
        );
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // All good → allow access
  return NextResponse.next();
}

// Apply middleware to these paths
export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/employee/:path*"],
};
