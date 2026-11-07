import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = ADMIN_ROUTES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ROUTES.includes(path);

  if (isAdminRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
