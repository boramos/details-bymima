import type { LandingDictionary, Locale } from "@/lib/i18n";
import { SiteContentService } from "@/services/SiteContentService";
import { PromoSectionService } from "@/services/PromoSectionService";

export async function getHomePageContent(locale: Locale, dictionary: LandingDictionary) {
  const [homeBanner, bestSellers, about, contact, promos] = await Promise.all([
    SiteContentService.getSection<LandingDictionary["homeBanner"]>("homeBanner", locale),
    SiteContentService.getSection<LandingDictionary["bestSellers"]>("bestSellers", locale),
    SiteContentService.getSection<LandingDictionary["about"]>("about", locale),
    SiteContentService.getSection<LandingDictionary["contact"]>("contact", locale),
    PromoSectionService.list("home", locale),
  ]);

  return {
    homeBanner: homeBanner ?? dictionary.homeBanner,
    bestSellers: bestSellers ?? dictionary.bestSellers,
    about: about ?? dictionary.about,
    contact: contact ?? dictionary.contact,
    promos,
  };
}
