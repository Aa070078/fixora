import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fixora-dev-secret-change-in-production"
);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let role: string | undefined;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      role = payload.role as string;
    } catch {
      // invalid token — treat as signed out
    }
  }

  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isTechPath = pathname.startsWith("/technician");

  if (isAdminPath || isTechPath) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (isAdminPath && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/technician", req.url));
    }
    if (isTechPath && role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/technician/:path*"],
};