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
  const session = request.auth;

  if ((isAccountPage || isAdminPage) && !session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
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
