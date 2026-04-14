import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import type { Locale } from "@/lib/i18n";
import { ProductService, type ProductUpsertInput } from "@/services/ProductService";
import { TranslationService } from "@/services/TranslationService";

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseImagePaths(value: unknown) {
  const paths = parseStringArray(value)
    .map((path) => path.trim())
    .filter(Boolean);

  const nonPlaceholderPaths = paths.filter((path) => path !== "/uploads/products/product-placeholder.svg");
  return (nonPlaceholderPaths.length > 0 ? nonPlaceholderPaths : paths).slice(0, 5);
}

function parseOptionGroups(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return JSON.parse(value) as unknown[];
  }

  return [];
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const { id } = await params;

  if (
    !id ||
    typeof body.slug !== "string" ||
    typeof body.name !== "string" ||
    typeof body.description !== "string" ||
    typeof body.locale !== "string"
  ) {
    return NextResponse.json({ success: false, error: "Invalid product payload" }, { status: 400 });
  }

  const locale = body.locale as Locale;
  const targetLocale = locale === "en" ? "es" : "en";
  const translated = await TranslationService.translateValue(
    {
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
      longDescription: body.longDescription ? String(body.longDescription) : "",
    },
    locale,
    targetLocale,
  );

  const imagePaths = parseImagePaths(body.imagePaths);

  const productInput: ProductUpsertInput = {
    slug: String(body.slug ?? ""),
    nameEs: locale === "es" ? String(body.name ?? "") : translated.name,
    nameEn: locale === "en" ? String(body.name ?? "") : translated.name,
    descriptionEs: locale === "es" ? String(body.description ?? "") : translated.description,
    descriptionEn: locale === "en" ? String(body.description ?? "") : translated.description,
    longDescriptionEs: locale === "es" ? (body.longDescription ? String(body.longDescription) : null) : (translated.longDescription || null),
    longDescriptionEn: locale === "en" ? (body.longDescription ? String(body.longDescription) : null) : (translated.longDescription || null),
    basePriceCop: Number(body.basePriceCop ?? 0),
    imagePath: imagePaths[0] ?? (body.imagePath ? String(body.imagePath) : null),
    imagePaths,
    imageEmoji: String(body.imageEmoji ?? "🌸"),
    gradientClass: String(body.gradientClass ?? "from-rose-100 via-white to-rose-50"),
    bestSeller: Boolean(body.bestSeller),
    active: body.active === undefined ? true : Boolean(body.active),
    categories: parseStringArray(body.categories),
    colors: parseStringArray(body.colors),
    styles: parseStringArray(body.styles),
    tags: parseStringArray(body.tags),
    optionGroups: parseOptionGroups(body.optionGroups),
  };

  const product = await ProductService.updateProduct(id, productInput);

  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const { id } = await params;
  await ProductService.deleteProduct(id);

  return NextResponse.json({ success: true });
}
