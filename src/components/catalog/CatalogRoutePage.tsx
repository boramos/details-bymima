import {
  getEventShowcaseByPageKey,
  type CatalogPageDefinition,
  type CatalogProduct,
} from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";

import About from "@/components/About";
import CatalogExperience from "@/components/catalog/CatalogExperience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type CatalogRoutePageProps = {
  page: CatalogPageDefinition;
  products: CatalogProduct[];
  locale: Locale;
  dictionary: LandingDictionary;
};

export default function CatalogRoutePage({ page, products, locale, dictionary }: CatalogRoutePageProps) {
  const infoPage = ["about", "contact", "subscriptions", "account"].includes(page.key);
  const eventShowcase = getEventShowcaseByPageKey(page.key);
  const isEventShowcase = Boolean(eventShowcase);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />

      <div className="pt-28">
        {page.key === "about" ? (
          <About content={dictionary.about} testimonials={dictionary.testimonials} variant="full" />
        ) : page.key === "contact" ? (
          <Contact content={dictionary.contact} variant="full" />
        ) : page.key === "subscriptions" || page.key === "account" ? (
          <section className="bg-[var(--color-primary-pale)]/50 py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-[2.5rem] border border-white/70 bg-white p-10 shadow-xl md:p-14">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
                  {page.eyebrow[locale]}
                </p>
                <h1 className="mt-4 text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-5xl">
                  {page.title[locale]} <span className="italic text-[var(--color-primary)]">{page.heroAccent[locale]}</span>
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
                  {page.description[locale]}
                </p>
                <div className="mt-8">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-95"
                  >
                    {locale === "es" ? "Solicitar información" : "Request information"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden bg-[var(--color-primary-pale)] py-24">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[var(--color-primary-light)]/60 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[var(--color-sage)]/15 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl xl:max-w-5xl space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
                  {page.eyebrow[locale]}
                </p>
                <h1 className="text-5xl font-bold font-[family-name:var(--font-playfair)] leading-[1.05] text-[var(--color-dark)] md:text-6xl">
                  {page.title[locale]} <span className="italic text-[var(--color-primary)]">{page.heroAccent[locale]}</span>
                </h1>
                <p className="text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
                  {page.description[locale]}
                </p>
              </div>
            </div>
          </section>
        )}

        {!infoPage && (
        <section className="bg-white/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isEventShowcase && eventShowcase ? (
              <div className="space-y-10">
                <div className="grid gap-6 rounded-[2.5rem] border border-[var(--color-primary-light)] bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                  <div className="space-y-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--color-primary)]">
                      {eventShowcase.consultationEyebrow[locale]}
                    </p>
                    <h2 className="text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-5xl">
                      {eventShowcase.consultationTitle[locale]}
                    </h2>
                    <p className="text-lg leading-relaxed text-[var(--color-muted)]">
                      {eventShowcase.consultationBody[locale]}
                    </p>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-95"
                    >
                      {eventShowcase.consultationCta[locale]}
                    </a>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {eventShowcase.gallery.slice(0, 2).map((item) => (
                      <div key={item.title[locale]} className={`flex aspect-[4/5] flex-col justify-end rounded-[2rem] bg-gradient-to-br ${item.gradientClass} p-5 shadow-sm`}>
                        <div className="mb-3 text-5xl">{item.emoji}</div>
                        <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                          {item.title[locale]}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                          {item.description[locale]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {eventShowcase.gallery.map((item) => (
                    <article key={item.title[locale]} className={`group flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br ${item.gradientClass} p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                      <div className="mb-4 text-5xl drop-shadow-sm">{item.emoji}</div>
                      <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                        {item.title[locale]}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                        {item.description[locale]}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <CatalogExperience key={page.key} products={products} locale={locale} ui={dictionary.catalogUi} />
            )}
          </div>
        </section>
        )}
      </div>

      <Footer content={dictionary.footer} />
    </main>
  );
}
