import "server-only";

import { headers } from "next/headers";

import {
  LOCALE_HEADER_NAME,
  type Locale,
  normalizeLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();

  return (
    normalizeLocale(headerStore.get(LOCALE_HEADER_NAME)) ??
    resolveLocaleFromAcceptLanguage(headerStore.get("accept-language"))
  );
}
