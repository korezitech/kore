import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // --- ROLE-BASED ACCESS CONTROL (RBAC) ---
    // If a user tries to go to /admin but they do not have the 'admin' role in the database,
    // intercept the request and silently redirect them to the dashboard.
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      // The master switch: If this returns false, the user is immediately kicked to the login page.
      // We check if the token exists to confirm they are actively authenticated.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// The Gatekeeper's Master List
// ANY route added here requires an active session to view.
export const config = {
  matcher: [
    "/accounts/:path*",
    "/admin/:path*",
    "/ai/:path*",
    "/dashboard/:path*",
    "/goals/:path*",
    "/investments/:path*",
    "/loans/:path*",
    "/profile/:path*",
    "/recycle-bin/:path*",
    "/transactions/:path*",
    "/notifications/:path*" // NEW: Securing the notifications page
  ],
};