import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { PromoSectionService } from "@/services/PromoSectionService";
import { prisma } from "@/lib/prisma";
import { TranslationService } from "@/services/TranslationService";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const body = await request.json();
  const { id } = await params;

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
  const existingPromo = await prisma.promoSection.findUnique({ where: { id } });

  if (!existingPromo) {
    return NextResponse.json({ success: false, error: "Promo not found" }, { status: 404 });
  }

  const translatedPromo = await prisma.promoSection.findFirst({
    where: {
      pageKey: existingPromo.pageKey,
      sortOrder: existingPromo.sortOrder,
      locale: targetLocale,
    },
    orderBy: { createdAt: "asc" },
  });

  const sourceItem = await PromoSectionService.update(id, body);

  const translatedItem = translatedPromo
    ? await PromoSectionService.update(translatedPromo.id, { ...translatedBody, locale: targetLocale })
    : await PromoSectionService.create({ ...translatedBody, locale: targetLocale });

  return NextResponse.json({ success: true, data: { source: sourceItem, translated: translatedItem } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing promo id" }, { status: 400 });
  }

  await PromoSectionService.remove(id);

  return NextResponse.json({ success: true });
}
