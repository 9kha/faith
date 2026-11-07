import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth";

const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/admin/login", "/admin/register"];

export async function middleware(request: NextRequest) {
  const session = await getAuthSession();
  const path = request.nextUrl.pathname;
  const isAdminRoute = ADMIN_ROUTES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ROUTES.includes(path);

  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
