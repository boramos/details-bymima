import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { SiteContentService, type EditableSectionKey } from "@/services/SiteContentService";
import { TranslationService } from "@/services/TranslationService";

export async function GET(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") ?? "en") as "en" | "es";
  const items = await SiteContentService.getSectionsForLocale(locale);

  return NextResponse.json({ success: true, data: items });
}

export async function PUT(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    sectionKey?: EditableSectionKey;
    locale?: "en" | "es";
    value?: unknown;
  };

  if (!body.sectionKey || !body.locale || body.value === undefined) {
    return NextResponse.json({ success: false, error: "Missing sectionKey, locale, or value" }, { status: 400 });
  }

  if (!['homeBanner', 'bestSellers', 'about', 'contact'].includes(body.sectionKey)) {
    return NextResponse.json({ success: false, error: "Invalid section key" }, { status: 400 });
  }

  if (!['en', 'es'].includes(body.locale)) {
    return NextResponse.json({ success: false, error: "Invalid locale" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translatedValue = await TranslationService.translateValue(body.value, body.locale, targetLocale);

  const [item, translatedItem] = await Promise.all([
    SiteContentService.upsertSection(body.sectionKey, body.locale, body.value),
    SiteContentService.upsertSection(body.sectionKey, targetLocale, translatedValue),
  ]);

  return NextResponse.json({ success: true, data: { source: item, translated: translatedItem } });
}
