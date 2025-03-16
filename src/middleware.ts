import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const AUTH_TOKEN_COOKIE = process.env.AUTH_TOKEN_COOKIE || "auth_token";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  const unprotectedRoutes = ["/auth/login", "/auth/register", "/"];
  const staticAssetExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".gif",
    ".ico",
  ];

  if (staticAssetExtensions.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  let isAuthenticated = false;
  if (token) {
    isAuthenticated = true;
  }

  if (isAuthenticated && unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthenticated && !unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
