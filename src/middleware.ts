import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// The Gatekeeper's Master List
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
    "/transactions/:path*"
  ],
};