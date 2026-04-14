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
    categoryId?: string;
    key?: string;
    name?: string;
    locale?: Locale;
    priceDeltaUsd?: number;
    imagePath?: string;
    active?: boolean;
    sortOrder?: number;
  };
  const { id } = await params;
  const existing = await prisma.includeItem.findUnique({ where: { id } });

  if (!existing || !body.categoryId || !body.key || !body.name || !body.locale) {
    return NextResponse.json({ success: false, error: "Invalid include item payload" }, { status: 400 });
  }

  const targetLocale = body.locale === "en" ? "es" : "en";
  const translatedName = await TranslationService.translateValue(body.name, body.locale, targetLocale);

  const item = await IncludeService.updateItem(id, {
    categoryId: body.categoryId,
    key: body.key,
    nameEs: body.locale === "es" ? body.name : translatedName,
    nameEn: body.locale === "en" ? body.name : translatedName,
    priceDeltaUsd: Number(body.priceDeltaUsd ?? existing.priceDeltaUsd),
    imagePath: body.imagePath ?? existing.imagePath,
    active: body.active ?? existing.active,
    sortOrder: body.sortOrder ?? existing.sortOrder,
  });

  return NextResponse.json({ success: true, data: item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const { id } = await params;
  await IncludeService.deleteItem(id);
  return NextResponse.json({ success: true });
}
