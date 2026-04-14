import type { Locale } from "@/lib/i18n";
import type { ProductOptionGroup } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

function toLocalizedText(es: string, en: string) {
  return { es, en };
}

function parseCategoryTargets(value: string | null | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [] as string[];
  }
}

type IncludeSnapshot = Awaited<ReturnType<typeof IncludeService.getSnapshot>>;

export class IncludeService {
  static async getSnapshot() {
    const [categories, configurations] = await Promise.all([
      prisma.includeCategory.findMany({
        where: { active: true },
        include: {
          items: {
            where: { active: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.includeConfiguration.findMany({
        where: { active: true },
        include: {
          items: {
            include: {
              includeItem: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    return { categories, configurations };
  }

  static async buildOptionGroups(productCategories: string[] = []): Promise<ProductOptionGroup[]> {
    const { categories, configurations } = await this.getSnapshot();

    const matchesProductCategories = (allowedCategoriesJson: string | null | undefined) => {
      const allowedCategories = parseCategoryTargets(allowedCategoriesJson);

      if (allowedCategories.length === 0 || productCategories.length === 0) {
        return true;
      }

      return allowedCategories.some((category) => productCategories.includes(category));
    };

    const filteredCategories = categories.filter((category) => matchesProductCategories(category.productCategories));
    const filteredConfigurations = configurations.filter((configuration) => matchesProductCategories(configuration.productCategories));

    if (filteredCategories.length === 0 || filteredConfigurations.length === 0) {
      return [];
    }

    const configurationGroup: ProductOptionGroup = {
      key: "configuration",
      label: toLocalizedText("Configuración", "Configuration"),
      description: toLocalizedText(
        "Elige una base y luego personaliza los extras incluidos.",
        "Choose a base and then customize the included extras.",
      ),
      inputType: "single",
      required: true,
      choices: filteredConfigurations.map((configuration) => ({
        key: configuration.key,
        label: toLocalizedText(configuration.labelEs, configuration.labelEn),
        priceDeltaCop: 0,
        presetSelections: Object.fromEntries(
          filteredCategories.map((category) => [
            category.key,
            configuration.items
              .filter((item) => item.includeItem.active && item.includeItem.category.key === category.key)
              .map((item) => item.includeItem.key),
          ]),
        ),
      })),
    };

    const categoryGroups: ProductOptionGroup[] = filteredCategories.map((category) => ({
      key: category.key,
      label: toLocalizedText(category.labelEs, category.labelEn),
      description: toLocalizedText(category.descriptionEs ?? category.labelEs, category.descriptionEn ?? category.labelEn),
      inputType: category.inputType as "single" | "multi",
      required: category.required,
      choices: category.items.map((item) => ({
        key: item.key,
        label: toLocalizedText(item.nameEs, item.nameEn),
        priceDeltaCop: item.priceDeltaUsd,
        imageUrl: item.imagePath ?? undefined,
      })),
    }));

    return [configurationGroup, ...categoryGroups];
  }

  static async createCategory(input: {
    key: string;
    labelEs: string;
    labelEn: string;
    descriptionEs?: string | null;
    descriptionEn?: string | null;
    productCategories: string[];
    inputType: string;
    required: boolean;
    active: boolean;
    sortOrder: number;
  }) {
    return prisma.includeCategory.create({ data: { ...input, productCategories: JSON.stringify(input.productCategories) } });
  }

  static async updateCategory(id: string, input: {
    key: string;
    labelEs: string;
    labelEn: string;
    descriptionEs?: string | null;
    descriptionEn?: string | null;
    productCategories: string[];
    inputType: string;
    required: boolean;
    active: boolean;
    sortOrder: number;
  }) {
    return prisma.includeCategory.update({ where: { id }, data: { ...input, productCategories: JSON.stringify(input.productCategories) } });
  }

  static async createItem(input: {
    categoryId: string;
    key: string;
    nameEs: string;
    nameEn: string;
    priceDeltaUsd: number;
    imagePath?: string | null;
    active: boolean;
    sortOrder: number;
  }) {
    return prisma.includeItem.create({ data: input });
  }

  static async updateItem(id: string, input: {
    categoryId: string;
    key: string;
    nameEs: string;
    nameEn: string;
    priceDeltaUsd: number;
    imagePath?: string | null;
    active: boolean;
    sortOrder: number;
  }) {
    return prisma.includeItem.update({ where: { id }, data: input });
  }

  static async createConfiguration(input: {
    key: string;
    labelEs: string;
    labelEn: string;
    descriptionEs?: string | null;
    descriptionEn?: string | null;
    productCategories: string[];
    active: boolean;
    sortOrder: number;
    includeItemIds: string[];
  }) {
    return prisma.includeConfiguration.create({
      data: {
        key: input.key,
        labelEs: input.labelEs,
        labelEn: input.labelEn,
        descriptionEs: input.descriptionEs ?? null,
        descriptionEn: input.descriptionEn ?? null,
        productCategories: JSON.stringify(input.productCategories),
        active: input.active,
        sortOrder: input.sortOrder,
        items: {
          create: input.includeItemIds.map((includeItemId) => ({ includeItemId })),
        },
      },
      include: { items: true },
    });
  }

  static async updateConfiguration(id: string, input: {
    key: string;
    labelEs: string;
    labelEn: string;
    descriptionEs?: string | null;
    descriptionEn?: string | null;
    productCategories: string[];
    active: boolean;
    sortOrder: number;
    includeItemIds: string[];
  }) {
    await prisma.includeConfigurationItem.deleteMany({ where: { configurationId: id } });

    return prisma.includeConfiguration.update({
      where: { id },
      data: {
        key: input.key,
        labelEs: input.labelEs,
        labelEn: input.labelEn,
        descriptionEs: input.descriptionEs ?? null,
        descriptionEn: input.descriptionEn ?? null,
        productCategories: JSON.stringify(input.productCategories),
        active: input.active,
        sortOrder: input.sortOrder,
        items: {
          create: input.includeItemIds.map((includeItemId) => ({ includeItemId })),
        },
      },
      include: { items: true },
    });
  }

  static async deleteCategory(id: string) {
    return prisma.includeCategory.delete({ where: { id } });
  }

  static async deleteItem(id: string) {
    return prisma.includeItem.delete({ where: { id } });
  }

  static async deleteConfiguration(id: string) {
    return prisma.includeConfiguration.delete({ where: { id } });
  }
}
