// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

// Define route-role mappings - use lowercase for comparison
const roleProtectedRoutes = [
  {
    path: "/admin",
    roles: ["admin"], // Compare with lowercase
  },
  {
    path: "/manager",
    roles: ["manager", "admin"], // Admins can access manager routes
  },
  {
    path: "/employee",
    roles: ["employee", "manager", "admin"], // Admins & managers can access employee routes
  },
];

// Public paths
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/api",
  "/_next",
  "/favicon.ico",
  "/public",
  "/images",
];

// Middleware function
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Skip public paths (including API routes for now)
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Get token - IMPORTANT: Add debug logging
  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // 3. No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Normalize the role from token
  // Your NextAuth returns "Admin", "Manager", "Employee" (uppercase first letter)
  // Convert to lowercase for consistent comparison
  const tokenRole = token.role || "";
  const userRole = tokenRole.toLowerCase();

  // 5. First, handle the root path "/"
  if (pathname === "/") {
    const dashboardUrl = getDashboardUrlByRole(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 6. Check if current path requires specific role
  let routeAccess = null;

  for (const route of roleProtectedRoutes) {
    if (pathname.startsWith(route.path)) {
      routeAccess = route;
      break;
    }
  }

  // 7. If on a protected route, check access
  if (routeAccess) {
    const allowedRoles = routeAccess.roles; // Already lowercase

    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard
      const redirectUrl = getDashboardUrlByRole(userRole);

      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // 8. Allow access to /dashboard for all authenticated users
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Helper function - expects lowercase role
function getDashboardUrlByRole(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "manager":
      return "/manager/dashboard";
    case "employee":
      return "/employee/dashboard";
    default:
      // If role is not recognized, go to a safe page
      console.warn(`⚠️ Unknown role: "${role}", redirecting to /dashboard`);
      return "/dashboard";
  }
}

// Apply middleware to these paths
export const config = {
  matcher: [
    // Match all paths except:
    "/",
    "/admin/:path*",
    "/manager/:path*",
    "/employee/:path*",
    "/dashboard/:path*",
  ],
};
