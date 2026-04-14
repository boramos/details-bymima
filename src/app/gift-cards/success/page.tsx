import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { GiftCardSuccessExperience } from "@/components/gift-cards/GiftCardSuccessExperience";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Details by MIMA | Gift Card Confirmed" };
}

export default async function GiftCardsSuccessPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <>
      <Navbar content={dictionary.navbar} />
      <main className="min-h-screen pt-16">
        <Suspense>
          <GiftCardSuccessExperience />
        </Suspense>
      </main>
      <Footer content={dictionary.footer} />
    </>
  );
}
