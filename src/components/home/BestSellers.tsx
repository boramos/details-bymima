import type { LandingDictionary, Locale } from "@/lib/i18n";
import { dbProductsToCatalogProducts } from "@/lib/product-adapter";
import { ProductService } from "@/services/ProductService";

import ProductCard from "@/components/catalog/ProductCard";

type BestSellersProps = {
  locale: Locale;
  content: LandingDictionary["bestSellers"];
  ui: LandingDictionary["catalogUi"];
};

export default async function BestSellers({ locale, content, ui }: BestSellersProps) {
  const dbProducts = await ProductService.getBestSellers();
  const products = dbProductsToCatalogProducts(dbProducts);

  return (
    <section className="bg-[var(--color-cream)] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              {content.eyebrow}
            </p>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-4xl">
              {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-secondary)] md:text-base">{content.description}</p>
          </div>

          <a
            href="/order"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-light)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:text-white"
          >
            {content.cta}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} ui={ui} />
          ))}
        </div>
      </div>
    </section>
  );
}
