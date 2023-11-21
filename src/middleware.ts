// import { NextResponse } from "next/server";
// import { isProtected } from "@/lib/urls";
// import { withAuth } from "next-auth/middleware";

// // middleware is applied to all routes, use conditionals to select
// export default withAuth(function (req) {
//   console.log({
//     url: req.nextUrl,
//     token: req.nextauth.token
//   })
  
//   // If the page is not protected and the user is not authenticated, redirect to login
//   // if (req.nextauth.token === null && isProtected(req.nextUrl.href)) {
//   //   req.nextUrl.pathname = "/login"; // Change this to your login route

//   //   return NextResponse.redirect(req.nextUrl);
//   // }
// }, {
//   pages: {
//     signIn: "/login"
//   },
//   callbacks: {
//     authorized: ({ token, req }) => {
      
//       if (
//         req.nextUrl.pathname.startsWith('/profile') &&
//         token === null
//       ) {
//         return false
//       }
//       return true
//     },
//   },
// });

// // export const config = { matcher: ["/profile"] }

import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional custom middleware logic can go here
  },
  {
    // pages: {
    //   signIn: "/login"
    // },
    callbacks: {
      authorized: ({ req, token }) => {
        // Protecting the '/protected' route
        if (req.nextUrl.pathname.startsWith('/profile') && !token) {
          return false; // Not authorized if no token
        }
        return true; // Authorized otherwise
      }
    }
  }
);
