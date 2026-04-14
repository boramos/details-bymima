import { GiftCardService } from "@/services/GiftCardService";
import { getRequestLocale } from "@/lib/request-locale";
import { getDictionary } from "@/lib/i18n";
import { GiftCardShop } from "@/components/gift-cards/GiftCardShop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function GiftCardsPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const catalogs = await GiftCardService.listCatalogs(true);

  return (
    <>
      <Navbar content={dictionary.navbar} />
      <main className="min-h-screen pt-16">
        <GiftCardShop catalogs={catalogs} locale={locale} />
      </main>
      <Footer content={dictionary.footer} />
    </>
  );
}
