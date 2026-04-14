import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import type { Locale } from "@/lib/i18n";
import { IncludeService } from "@/services/IncludeService";
import { TranslationService } from "@/services/TranslationService";

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const body = (await request.json()) as {
    categoryId?: string;
    key?: string;
    name?: string;
    locale?: Locale;
    priceDeltaUsd?: number;
    imagePath?: string;
    active?: boolean;
    sortOrder?: number;
  };

  if (!body.categoryId || !body.key || !body.name || !body.locale) {
    return NextResponse.json({ success: false, error: "Invalid include item payload" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translatedName = await TranslationService.translateValue(body.name, body.locale, targetLocale);

  const item = await IncludeService.createItem({
    categoryId: body.categoryId,
    key: body.key,
    nameEs: body.locale === "es" ? body.name : translatedName,
    nameEn: body.locale === "en" ? body.name : translatedName,
    priceDeltaUsd: Number(body.priceDeltaUsd ?? 0),
    imagePath: body.imagePath ?? null,
    active: body.active ?? true,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ success: true, data: item });
}
