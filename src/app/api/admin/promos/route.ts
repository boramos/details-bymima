import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { PromoSectionService } from "@/services/PromoSectionService";
import { TranslationService } from "@/services/TranslationService";

export async function GET(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get("pageKey") ?? undefined;
  const locale = (searchParams.get("locale") ?? undefined) as "en" | "es" | undefined;
  const items = await PromoSectionService.list(pageKey, locale);

  return NextResponse.json({ success: true, data: items });
}

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const body = await request.json();

  if (
    typeof body?.pageKey !== "string" ||
    typeof body?.locale !== "string" ||
    typeof body?.title !== "string" ||
    typeof body?.description !== "string"
  ) {
    return NextResponse.json({ success: false, error: "Invalid promo payload" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translatedBody = await TranslationService.translateValue(body, body.locale, targetLocale);

  const [item, translatedItem] = await Promise.all([
    PromoSectionService.create(body),
    PromoSectionService.create({ ...translatedBody, locale: targetLocale }),
  ]);

  return NextResponse.json({ success: true, data: { source: item, translated: translatedItem } });
}
