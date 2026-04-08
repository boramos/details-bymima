import type { Metadata } from "next";

import PaypalReturnExperience from "@/components/checkout/PaypalReturnExperience";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Details by MIMA | PayPal return",
  };
}

export default async function PaypalReturnPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      <div className="pt-28">
        <PaypalReturnExperience />
      </div>
      <Footer content={dictionary.footer} />
    </main>
  );
}
