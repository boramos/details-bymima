import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import type { Locale } from "@/lib/i18n";
import { IncludeService } from "@/services/IncludeService";
import { TranslationService } from "@/services/TranslationService";

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) return response;

  const body = (await request.json()) as {
    key?: string;
    label?: string;
    description?: string;
    locale?: Locale;
    productCategories?: string[];
    inputType?: string;
    required?: boolean;
    active?: boolean;
    sortOrder?: number;
  };

  if (!body.key || !body.label || !body.locale) {
    return NextResponse.json({ success: false, error: "Invalid category payload" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translated = await TranslationService.translateValue(
    { label: body.label, description: body.description ?? "" },
    body.locale,
    targetLocale,
  );

  const item = await IncludeService.createCategory({
    key: body.key,
    labelEs: body.locale === "es" ? body.label : translated.label,
    labelEn: body.locale === "en" ? body.label : translated.label,
    descriptionEs: body.locale === "es" ? (body.description ?? null) : (translated.description || null),
    descriptionEn: body.locale === "en" ? (body.description ?? null) : (translated.description || null),
    productCategories: body.productCategories ?? [],
    inputType: body.inputType ?? "single",
    required: body.required ?? false,
    active: body.active ?? true,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ success: true, data: item });
}
