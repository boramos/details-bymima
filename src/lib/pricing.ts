import type { CatalogProductDetail, ProductOptionGroup } from "@/lib/catalog";
import { ConfigService } from "@/services/ConfigService";

export type ProductSelections = Record<string, string[]>;

export type PriceLine = {
  groupKey: string;
  choiceKey: string;
  label: string;
  amountCop: number;
};

export type ProductPriceSummary = {
  totalCop: number;
  basePriceCop: number;
  lines: PriceLine[];
};

function getDefaultGroupSelection(group: ProductOptionGroup): string[] {
  if (group.inputType === "multi") {
    return [];
  }

  if (!group.required) {
    return [];
  }

  return group.choices[0] ? [group.choices[0].key] : [];
}

export function getDefaultSelections(product: CatalogProductDetail): ProductSelections {
  return product.optionGroups.reduce<ProductSelections>((accumulator, group) => {
    accumulator[group.key] = getDefaultGroupSelection(group);
    return accumulator;
  }, {});
}

export function normalizeSelections(product: CatalogProductDetail, selections: ProductSelections): ProductSelections {
  return product.optionGroups.reduce<ProductSelections>((accumulator, group) => {
    const value = selections[group.key];

    if (!value || value.length === 0) {
      accumulator[group.key] = getDefaultGroupSelection(group);
      return accumulator;
    }

    if (group.inputType === "multi") {
      accumulator[group.key] = value.filter((choiceKey) => group.choices.some((choice) => choice.key === choiceKey));
      return accumulator;
    }

    if (!group.required && value.length === 0) {
      accumulator[group.key] = [];
      return accumulator;
    }

    accumulator[group.key] = [value[0]];
    return accumulator;
  }, {});
}

export function calculateProductPrice(
  product: CatalogProductDetail,
  selections: ProductSelections,
  locale: "es" | "en",
  freeDeliveryThreshold = 100
): ProductPriceSummary {
  const normalizedSelections = normalizeSelections(product, selections);
  const lines: PriceLine[] = [];
  let totalCop = product.basePriceCop;
  let deliveryChoiceKey: string | null = null;
  let deliveryChoiceLabel: string | null = null;
  let deliveryChoiceAmount = 0;

  for (const group of product.optionGroups) {
    const selectedKeys = normalizedSelections[group.key] ?? [];

    if (group.key === "delivery") {
      const selectedKey = selectedKeys[0];
      const choice = group.choices.find((entry) => entry.key === selectedKey);

      if (choice) {
        deliveryChoiceKey = choice.key;
        deliveryChoiceLabel = choice.label[locale];
        deliveryChoiceAmount = choice.priceDeltaCop;
      }

      continue;
    }

    for (const selectedKey of selectedKeys) {
      const choice = group.choices.find((entry) => entry.key === selectedKey);

      if (!choice || choice.priceDeltaCop === 0) {
        continue;
      }

      totalCop += choice.priceDeltaCop;
      lines.push({
        groupKey: group.key,
        choiceKey: choice.key,
        label: choice.label[locale],
        amountCop: choice.priceDeltaCop,
      });
    }
  }

  if (deliveryChoiceKey && deliveryChoiceLabel) {
    const deliveryAmount = totalCop >= freeDeliveryThreshold ? 0 : deliveryChoiceAmount;
    totalCop += deliveryAmount;

    lines.push({
      groupKey: "delivery",
      choiceKey: deliveryChoiceKey,
      label: deliveryChoiceLabel,
      amountCop: deliveryAmount,
    });
  }

  return {
    totalCop,
    basePriceCop: product.basePriceCop,
    lines,
  };
}
