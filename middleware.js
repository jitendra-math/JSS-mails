import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // login page ko allow karo
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // static files allow
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // cookie check
  const auth = req.cookies.get("jss-auth")?.value;

  // agar dashboard ya protected route hai
  if (pathname.startsWith("/dashboard")) {
    if (!auth || auth !== "logged-in") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// apply on these routes
export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};