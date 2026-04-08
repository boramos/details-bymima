import type { Metadata } from "next";

import CartPageExperience from "@/components/cart/CartPageExperience";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return {
    title: `Details by MIMA | ${dictionary.cartUi.title} ${dictionary.cartUi.accent}`,
    description: dictionary.cartUi.emptyBody,
  };
}

export default async function CartPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      <div className="pt-28">
        <CartPageExperience locale={locale} ui={dictionary.cartUi} />
      </div>
      <Footer content={dictionary.footer} />
    </main>
  );
}
