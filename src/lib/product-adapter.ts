import type { ProductWithParsedFields } from "@/services/ProductService";
import type { CatalogProduct, CatalogProductDetail, LocalizedText } from "@/lib/catalog";

/**
 * Product Adapter - Transforms database products to frontend catalog shapes
 * 
 * Database schema uses flat columns (nameEs, nameEn, descriptionEs, descriptionEn)
 * Frontend expects nested LocalizedText objects ({ es: "...", en: "..." })
 */

/**
 * Convert DB product to CatalogProduct shape for listings
 */
export function dbProductToCatalogProduct(dbProduct: ProductWithParsedFields): CatalogProduct {
  const formattedPrice = `US$${dbProduct.basePriceCop.toFixed(2)}`;
  
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: {
      es: dbProduct.nameEs,
      en: dbProduct.nameEn,
    },
    description: {
      es: dbProduct.descriptionEs,
      en: dbProduct.descriptionEn,
    },
    priceLabel: {
      es: formattedPrice,
      en: formattedPrice,
    },
    basePriceCop: dbProduct.basePriceCop,
    imagePath: dbProduct.imagePath ?? dbProduct.imagePaths?.[0] ?? null,
    imagePaths: dbProduct.imagePaths,
    imageEmoji: dbProduct.imageEmoji,
    gradientClass: dbProduct.gradientClass,
    colors: dbProduct.colors,
    categories: dbProduct.categories,
    styles: dbProduct.styles,
    tags: dbProduct.tags,
    bestSeller: dbProduct.bestSeller,
  };
}

/**
 * Convert DB product to CatalogProductDetail shape for product detail pages
 */
export function dbProductToCatalogProductDetail(dbProduct: ProductWithParsedFields): CatalogProductDetail {
  return {
    ...dbProductToCatalogProduct(dbProduct),
    basePriceCop: dbProduct.basePriceCop,
    longDescription: {
      es: dbProduct.longDescriptionEs ?? dbProduct.descriptionEs,
      en: dbProduct.longDescriptionEn ?? dbProduct.descriptionEn,
    },
    optionGroups: transformOptionGroups(dbProduct.optionGroups),
  };
}

/**
 * Transform option groups from DB format to frontend format
 * Ensures all nested LocalizedText fields are properly structured
 */
function transformOptionGroups(optionGroups: any[]): any[] {
  if (!Array.isArray(optionGroups)) {
    return [];
  }

  return optionGroups.map((group) => ({
    ...group,
    label: ensureLocalizedText(group.label),
    description: group.description ? ensureLocalizedText(group.description) : undefined,
    choices: Array.isArray(group.choices)
      ? group.choices.map((choice: any) => ({
          ...choice,
          label: ensureLocalizedText(choice.label),
          presetSelections: choice.presetSelections || undefined,
        }))
      : [],
  }));
}

/**
 * Ensure a value is a proper LocalizedText object
 * Handles cases where it might already be correct or needs transformation
 */
function ensureLocalizedText(value: any): LocalizedText {
  if (typeof value === "object" && value !== null && "es" in value && "en" in value) {
    return value as LocalizedText;
  }
  
  // Fallback: if it's a string, use it for both languages
  if (typeof value === "string") {
    return { es: value, en: value };
  }
  
  // Last resort: empty strings
  return { es: "", en: "" };
}

/**
 * Batch convert multiple DB products to CatalogProduct[]
 */
export function dbProductsToCatalogProducts(dbProducts: ProductWithParsedFields[]): CatalogProduct[] {
  return dbProducts.map(dbProductToCatalogProduct);
}

/**
 * Batch convert multiple DB products to CatalogProductDetail[]
 */
export function dbProductsToCatalogProductDetails(dbProducts: ProductWithParsedFields[]): CatalogProductDetail[] {
  return dbProducts.map(dbProductToCatalogProductDetail);
}
