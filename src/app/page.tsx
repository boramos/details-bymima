import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BestSellers from "@/components/home/BestSellers";
import HomeBanner from "@/components/HomeBanner";
import SameDayCountdown from "@/components/SameDayCountdown";
import TrustBadges from "@/components/home/TrustBadges";
import SubscriptionsModal from "@/components/home/SubscriptionsModal";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export default async function Home() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar content={dictionary.navbar} />
      <HomeBanner content={dictionary.homeBanner} />
      <SameDayCountdown content={dictionary.sameDayCountdown} />
      <BestSellers locale={locale} content={dictionary.bestSellers} ui={dictionary.catalogUi} />
      <TrustBadges locale={locale} />
      <About content={dictionary.about} testimonials={dictionary.testimonials} variant="home" />
      <Contact content={dictionary.contact} variant="home" />
      <Footer content={dictionary.footer} />
      <SubscriptionsModal checkoutUi={dictionary.checkoutUi} />
    </main>
  );
}
