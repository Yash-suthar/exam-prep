import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicPrefixes = ["/reset-password", "/forgot-password"];

const protectedPrefixes = [
  "/dashboard",
  "/library",
  "/books",
  "/materials",
  "/papers",
  "/notices",
  "/exams",
  "/profile",
  "/admin",
  "/onboarding",
  "/goals",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
  const needsAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session?.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};
