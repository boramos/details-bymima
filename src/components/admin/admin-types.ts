export type AdminProduct = {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  longDescriptionEs?: string | null;
  longDescriptionEn?: string | null;
  basePriceCop: number;
  imagePath?: string | null;
  imagePaths?: string[];
  imageEmoji: string;
  gradientClass: string;
  bestSeller: boolean;
  active: boolean;
  categories: string[];
  colors: string[];
  styles: string[];
  tags: string[];
  optionGroups: unknown[];
};

export type AdminConfig = {
  id: string;
  key: string;
  value: string;
  valueType: string;
  description: string | null;
  category: string;
  parsedValue: string | number | boolean | object;
};

export type AdminContent = {
  id: string;
  sectionKey: string;
  locale: string;
  value: string;
};

export type AdminPromo = {
  id: string;
  pageKey: string;
  locale: string;
  badge: string | null;
  title: string;
  description: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  backgroundClass: string | null;
  active: boolean;
  sortOrder: number;
};

export type Locale = "en" | "es";

export type ProductDraft = {
  locale: Locale;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  basePriceCop: string;
  imagePath: string;
  imagePaths: string[];
  gradientClass: string;
  bestSeller: boolean;
  active: boolean;
  categories: string[];
  colors: string[];
  styles: string[];
  tags: string[];
  optionGroups: string;
};

export type PromoDraft = {
  pageKey: string;
  locale: Locale;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundClass: string;
  active: boolean;
  sortOrder: string;
};

export function productToDraft(locale: Locale, product?: AdminProduct): ProductDraft {
  return {
    locale,
    slug: product?.slug ?? "",
    name: locale === "es" ? product?.nameEs ?? "" : product?.nameEn ?? "",
    description: locale === "es" ? product?.descriptionEs ?? "" : product?.descriptionEn ?? "",
    longDescription: locale === "es" ? product?.longDescriptionEs ?? "" : product?.longDescriptionEn ?? "",
    basePriceCop: String(product?.basePriceCop ?? 0),
    imagePath: product?.imagePath ?? "/uploads/products/product-placeholder.svg",
    imagePaths: product?.imagePaths?.length ? product.imagePaths : [product?.imagePath ?? "/uploads/products/product-placeholder.svg"],
    gradientClass: product?.gradientClass ?? "from-rose-100 via-white to-orange-100",
    bestSeller: product?.bestSeller ?? false,
    active: product?.active ?? true,
    categories: product?.categories ?? [],
    colors: product?.colors ?? [],
    styles: product?.styles ?? [],
    tags: product?.tags ?? [],
    optionGroups: JSON.stringify(product?.optionGroups ?? [], null, 2),
  };
}

export function promoToDraft(locale: Locale, promo?: AdminPromo): PromoDraft {
  return {
    pageKey: promo?.pageKey ?? "home",
    locale,
    badge: promo?.badge ?? "",
    title: promo?.title ?? "",
    description: promo?.description ?? "",
    ctaLabel: promo?.ctaLabel ?? "",
    ctaHref: promo?.ctaHref ?? "/order",
    backgroundClass: promo?.backgroundClass ?? "from-rose-100 via-white to-orange-100",
    active: promo?.active ?? true,
    sortOrder: String(promo?.sortOrder ?? 0),
  };
}

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
  passport: { status: string; endDate: string } | null;
};
