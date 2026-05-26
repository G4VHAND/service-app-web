import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Halaman yang boleh diakses tanpa login
  const publicPaths = [
    "/login",
    "/setup-admin",
    "/forgot-password",
    "/reset-password",
  ];

  const adminOnlyPaths = [
  "/users",
  "/laporan",
  "/keluar",
];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Kalau belum login, redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    adminOnlyPaths.some((p) => pathname.startsWith(p)) &&
    token.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/setup|api/forgot-password|api/reset-password|_next/static|_next/image|favicon.ico).*)",
  ],
};