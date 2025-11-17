import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/*",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route.replace("/*", "")) // supports wildcards
  );

  if (!isProtected) return NextResponse.next();

  // Get the JWT session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Expired token → redirect to login
  if (token.error === "ExpiredToken") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // protect everything under /dashboard
  ],
};
