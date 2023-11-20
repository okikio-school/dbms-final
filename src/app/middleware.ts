import { NextResponse } from "next/server";
import { isProtected } from "@/lib/urls";
import { withAuth } from "next-auth/middleware";

// middleware is applied to all routes, use conditionals to select
export default withAuth(function (req) {
  // If the page is not protected and the user is not authenticated, redirect to login
  if (req.nextauth.token === null && isProtected(req.nextUrl.href)) {
    req.nextUrl.pathname = "/login"; // Change this to your login route

    return NextResponse.redirect(req.nextUrl);
  }
}, {
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});
