import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";

export type PromoSectionInput = {
  pageKey: string;
  locale: Locale;
  badge?: string | null;
  title: string;
  description: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundClass?: string | null;
  active?: boolean;
  sortOrder?: number;
};

export class PromoSectionService {
  static async list(pageKey?: string, locale?: Locale) {
    return prisma.promoSection.findMany({
      where: {
        ...(pageKey ? { pageKey } : {}),
        ...(locale ? { locale } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  static async create(input: PromoSectionInput) {
    return prisma.promoSection.create({
      data: {
        pageKey: input.pageKey,
        locale: input.locale,
        badge: input.badge ?? null,
        title: input.title,
        description: input.description,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        backgroundClass: input.backgroundClass ?? null,
        active: input.active ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  static async update(id: string, input: PromoSectionInput) {
    return prisma.promoSection.update({
      where: { id },
      data: {
        pageKey: input.pageKey,
        locale: input.locale,
        badge: input.badge ?? null,
        title: input.title,
        description: input.description,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        backgroundClass: input.backgroundClass ?? null,
        active: input.active ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  static async remove(id: string) {
    return prisma.promoSection.delete({ where: { id } });
  }
}
