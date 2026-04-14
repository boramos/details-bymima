import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";

export type EditableSectionKey = "homeBanner" | "bestSellers" | "about" | "contact";

export class SiteContentService {
  static async getSection<T>(sectionKey: EditableSectionKey, locale: Locale): Promise<T | null> {
    const section = await prisma.siteContent.findUnique({
      where: {
        sectionKey_locale: {
          sectionKey,
          locale,
        },
      },
    });

    if (!section) {
      return null;
    }

    return JSON.parse(section.value) as T;
  }

  static async getSectionsForLocale(locale: Locale) {
    return prisma.siteContent.findMany({
      where: { locale },
      orderBy: { sectionKey: "asc" },
    });
  }

  static async upsertSection(sectionKey: EditableSectionKey, locale: Locale, value: unknown) {
    return prisma.siteContent.upsert({
      where: {
        sectionKey_locale: {
          sectionKey,
          locale,
        },
      },
      create: {
        sectionKey,
        locale,
        value: JSON.stringify(value),
      },
      update: {
        value: JSON.stringify(value),
      },
    });
  }
}
