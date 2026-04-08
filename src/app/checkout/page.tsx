import type { Metadata } from "next";

import CheckoutPageExperience from "@/components/checkout/CheckoutPageExperience";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return {
    title: `Details by MIMA | ${dictionary.checkoutUi.title} ${dictionary.checkoutUi.accent}`,
    description: dictionary.checkoutUi.checkoutDisclaimer,
  };
}

export default async function CheckoutPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      <div className="pt-28">
        <CheckoutPageExperience locale={locale} ui={dictionary.checkoutUi} cartUi={dictionary.cartUi} />
      </div>
      <Footer content={dictionary.footer} />
    </main>
  );
}
