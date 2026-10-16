import { NextResponse, type NextRequest } from "next/server";
import { authRequired } from "@/lib/auth-mode";

const SESSION_COOKIE = "saige_session";
const PUBLIC_PATHS = new Set(["/", "/login"]);

/**
 * Optimistic route protection: send visitors without a session cookie to the
 * login page. The backend still authenticates every API call; this only avoids
 * flashing private pages to signed-out visitors.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!authRequired() || PUBLIC_PATHS.has(pathname) || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Skip API/backend rewrites, Next internals and static files.
  matcher: ["/((?!api|backend|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
