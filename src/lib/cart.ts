import type { Locale } from "@/lib/i18n";
import type { CatalogProductDetail } from "@/lib/catalog";
import { calculateProductPrice, normalizeSelections, type ProductSelections } from "@/lib/pricing";

export const CART_STORAGE_KEY = "details-by-mima-cart";

export type CartItem = {
  id: string;
  productSlug: string;
  productName: string;
  productEmoji: string;
  productGradientClass: string;
  quantity: number;
  selections: ProductSelections;
  note: string;
  unitPriceCop: number;
};

function serializeSelections(selections: ProductSelections): string {
  return Object.entries(selections)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([groupKey, values]) => `${groupKey}:${[...values].sort().join(",")}`)
    .join("|");
}

export function buildCartItemId(productSlug: string, selections: ProductSelections, note: string): string {
  return `${productSlug}__${serializeSelections(selections)}__${note.trim().toLowerCase()}`;
}

export function createCartItem(product: CatalogProductDetail, selections: ProductSelections, note: string, locale: Locale): CartItem {
  const normalizedSelections = normalizeSelections(product, selections);
  const price = calculateProductPrice(product, normalizedSelections, locale);

  return {
    id: buildCartItemId(product.slug, normalizedSelections, note),
    productSlug: product.slug,
    productName: product.name[locale],
    productEmoji: product.imageEmoji,
    productGradientClass: product.gradientClass,
    quantity: 1,
    selections: normalizedSelections,
    note,
    unitPriceCop: price.totalCop,
  };
}

export function getCartSubtotalCop(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPriceCop * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
