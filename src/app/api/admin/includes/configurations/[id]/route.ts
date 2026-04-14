import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import type { Locale } from "@/lib/i18n";
import { IncludeService } from "@/services/IncludeService";
import { prisma } from "@/lib/prisma";
import { TranslationService } from "@/services/TranslationService";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const body = (await request.json()) as {
    key?: string;
    label?: string;
    description?: string;
    locale?: Locale;
    productCategories?: string[];
    active?: boolean;
    sortOrder?: number;
    includeItemIds?: string[];
  };
  const { id } = await params;
  const existing = await prisma.includeConfiguration.findUnique({ where: { id } });

  if (!existing || !body.key || !body.label || !body.locale) {
    return NextResponse.json({ success: false, error: "Invalid configuration payload" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translated = await TranslationService.translateValue(
    { label: body.label, description: body.description ?? "" },
    body.locale,
    targetLocale,
  );

  const item = await IncludeService.updateConfiguration(id, {
    key: body.key,
    labelEs: body.locale === "es" ? body.label : translated.label,
    labelEn: body.locale === "en" ? body.label : translated.label,
    descriptionEs: body.locale === "es" ? (body.description ?? null) : (translated.description || null),
    descriptionEn: body.locale === "en" ? (body.description ?? null) : (translated.description || null),
    productCategories: body.productCategories ?? JSON.parse(existing.productCategories),
    active: body.active ?? existing.active,
    sortOrder: body.sortOrder ?? existing.sortOrder,
    includeItemIds: body.includeItemIds ?? [],
  });

  return NextResponse.json({ success: true, data: item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const { id } = await params;
  await IncludeService.deleteConfiguration(id);
  return NextResponse.json({ success: true });
}
