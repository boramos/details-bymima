import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";

import AppProviders from "@/components/providers/AppProviders";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body
        className={`${dmSans.variable} ${playfair.variable} font-sans antialiased bg-[var(--color-cream)] text-[var(--color-dark)]`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
