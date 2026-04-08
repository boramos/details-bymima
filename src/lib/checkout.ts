import { formatPriceCop } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { dbProductToCatalogProductDetail } from "@/lib/product-adapter";
import { calculateProductPrice, normalizeSelections, type ProductSelections } from "@/lib/pricing";
import { ProductService } from "@/services/ProductService";
import { ConfigService } from "@/services/ConfigService";

export type CheckoutDeliveryMethod = "standard" | "tomorrow" | "today" | "pickup";

export type CheckoutDraftItem = {
  productSlug: string;
  quantity: number;
  selections: ProductSelections;
  note: string;
};

export type CheckoutQuoteItem = {
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedLabels: string[];
  note: string;
};

export type CheckoutQuote = {
  items: CheckoutQuoteItem[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: CheckoutDeliveryMethod;
  freeDeliveryApplied: boolean;
  sameDayEligible: boolean;
  hasActivePassport: boolean;
  passportApplied: boolean;
  passportPrice: number;
};

export const SAME_DAY_CUTOFF_HOUR_MIAMI = 14;

export async function getDeliveryPrices(): Promise<Record<CheckoutDeliveryMethod, number>> {
  const [standard, tomorrow, today, pickup] = await Promise.all([
    ConfigService.getOrDefault("delivery_standard_usd", 4),
    ConfigService.getOrDefault("delivery_tomorrow_usd", 7),
    ConfigService.getOrDefault("delivery_today_usd", 10),
    ConfigService.getOrDefault("delivery_pickup_usd", 0),
  ]);

  return {
    standard: standard as number,
    tomorrow: tomorrow as number,
    today: today as number,
    pickup: pickup as number,
  };
}

export function isSameDayEligible(date = new Date()): boolean {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  });

  const hour = Number(formatter.format(date));
  return hour < SAME_DAY_CUTOFF_HOUR_MIAMI;
}

function removeDeliverySelection(selections: ProductSelections): ProductSelections {
  const next = { ...selections };
  delete next.delivery;
  return next;
}

export async function buildCheckoutQuote(input: {
  locale: Locale;
  items: CheckoutDraftItem[];
  deliveryMethod: CheckoutDeliveryMethod;
  includePassport?: boolean;
  hasActivePassport?: boolean;
}): Promise<CheckoutQuote> {
  try {
    const [freeDeliveryThreshold, passportPrice] = await Promise.all([
      ConfigService.getOrDefault("free_delivery_threshold_usd", 100),
      ConfigService.getOrDefault("passport_price_usd", 19.99),
    ]);

    const items = await Promise.all(
      input.items
        .filter((item) => item.quantity > 0)
        .map<Promise<CheckoutQuoteItem>>(async (item) => {
          const dbProduct = await ProductService.getProductBySlug(item.productSlug);

          if (!dbProduct) {
            throw new Error(`Unknown product: ${item.productSlug}`);
          }

          const product = dbProductToCatalogProductDetail(dbProduct);

        const sanitizedSelections = removeDeliverySelection(item.selections);
        const normalizedSelections = normalizeSelections(product, sanitizedSelections);
        const summary = calculateProductPrice(product, normalizedSelections, input.locale);

        const selectedLabels = product.optionGroups.flatMap((group) => {
          if (group.key === "palette" || group.key === "delivery") {
            return [];
          }

          const selectedKeys = normalizedSelections[group.key] ?? [];

          return selectedKeys
            .map((selectedKey) => group.choices.find((choice) => choice.key === selectedKey))
            .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
            .map((choice) => choice.label[input.locale]);
        });

          return {
            productSlug: product.slug,
            productName: product.name[input.locale],
            quantity: item.quantity,
            unitPrice: summary.totalCop,
            lineTotal: summary.totalCop * item.quantity,
            selectedLabels,
            note: item.note,
          };
        })
    );

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const sameDayEligible = isSameDayEligible();
    const hasActivePassport = input.hasActivePassport ?? false;
    const passportApplied = Boolean(input.includePassport) && !hasActivePassport;

    if (input.deliveryMethod === "today" && !sameDayEligible) {
      throw new Error("Same-day delivery is no longer available for today.");
    }

    const [deliveryPrices, taxRate] = await Promise.all([
      getDeliveryPrices(),
      ConfigService.getOrDefault("tax_rate", 0.07),
    ]);

    const freeDeliveryApplied =
      subtotal >= (freeDeliveryThreshold as number) ||
      input.deliveryMethod === "pickup" ||
      hasActivePassport ||
      passportApplied;
    const deliveryFee = freeDeliveryApplied ? 0 : deliveryPrices[input.deliveryMethod];
    const taxes = Number((subtotal * (taxRate as number)).toFixed(2));
    const passportCharge = passportApplied ? (passportPrice as number) : 0;

    const total = Number((subtotal + taxes + deliveryFee + passportCharge).toFixed(2));

    return {
      items,
      subtotal,
      taxes,
      deliveryFee,
      total,
      deliveryMethod: input.deliveryMethod,
      freeDeliveryApplied,
      sameDayEligible,
      hasActivePassport,
      passportApplied,
      passportPrice: passportCharge,
    };
  } catch (error) {
    console.error("buildCheckoutQuote error:", error);
    throw error;
  }
}

export function formatCheckoutTotal(amount: number, locale: Locale) {
  return formatPriceCop(amount, locale);
}
