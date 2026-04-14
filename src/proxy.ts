import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  resolvePreferredLocale,
} from "@/lib/i18n";

export default auth(function proxy(request: NextRequest & { auth?: { user?: unknown } | null }) {
  const { nextUrl } = request;

  const isAccountPage = nextUrl.pathname.startsWith("/account");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = nextUrl.pathname === "/admin/login";
  const session = request.auth;
  const sessionUser = typeof session?.user === "object" && session.user !== null ? session.user : null;
  const sessionRole = sessionUser && "role" in sessionUser ? sessionUser.role : null;

  if (isAccountPage && !session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminPage && !isAdminLoginPage && !session) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  if (isAdminLoginPage && typeof sessionRole === "string") {
    return NextResponse.redirect(new URL(sessionRole.toLowerCase() === "admin" ? "/admin" : "/account", nextUrl));
  }

  if (isAdminPage && !isAdminLoginPage && typeof sessionRole === "string" && sessionRole.toLowerCase() !== "admin") {
    return NextResponse.redirect(new URL("/account", nextUrl));
  }

  const requestHeaders = new Headers(request.headers);
  const locale = resolvePreferredLocale({
    queryLocale: nextUrl.searchParams.get("lang"),
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    headerLocale: request.headers.get(LOCALE_HEADER_NAME),
    acceptLanguage: request.headers.get("accept-language"),
  });

  requestHeaders.set(LOCALE_HEADER_NAME, locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
