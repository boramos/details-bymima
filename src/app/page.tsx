import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BestSellers from "@/components/home/BestSellers";
import HomeBanner from "@/components/HomeBanner";
import SameDayCountdown from "@/components/SameDayCountdown";
import PromoSections from "@/components/home/PromoSections";
import TrustBadges from "@/components/home/TrustBadges";
import SubscriptionsModal from "@/components/home/SubscriptionsModal";
import { getDictionary } from "@/lib/i18n";
import { getHomePageContent } from "@/lib/home-content";
import { getRequestLocale } from "@/lib/request-locale";

export default async function Home() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const homeContent = await getHomePageContent(locale, dictionary);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar content={dictionary.navbar} />
      <HomeBanner content={homeContent.homeBanner} />
      <SameDayCountdown content={dictionary.sameDayCountdown} />
      <PromoSections items={homeContent.promos} />
      <BestSellers locale={locale} content={homeContent.bestSellers} ui={dictionary.catalogUi} />
      <TrustBadges locale={locale} />
      <About content={homeContent.about} testimonials={dictionary.testimonials} variant="home" />
      <Contact content={homeContent.contact} variant="home" />
      <Footer content={dictionary.footer} />
      <SubscriptionsModal checkoutUi={dictionary.checkoutUi} />
    </main>
  );
}
