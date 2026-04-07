import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getCookieName, isApiPath } from "@/lib/auth";

const jwtSecret = process.env.JWT_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "replace-me-in-production");

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured for production.");
}

const secret = new TextEncoder().encode(jwtSecret);

const protectedPrefixes = ["/dashboard", "/attendance", "/leave", "/reports", "/api"];
const hrOnlyPrefixes = ["/dashboard/hr", "/reports", "/api/employees", "/api/reports", "/api/leave/approve"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/auth/me")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getCookieName())?.value;

  if (!token) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = await jwtVerify(token, secret);
    const role = verified.payload.role as string | undefined;

    if (
      role !== "HR" &&
      hrOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))
    ) {
      if (isApiPath(pathname)) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/dashboard/employee", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};