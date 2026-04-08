import Link from "next/link";

import { formatPriceCop, getProductStartingPriceCop, type CatalogProduct } from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";

type ProductCardProps = {
  product: CatalogProduct;
  locale: Locale;
  ui: LandingDictionary["catalogUi"];
};

export default function ProductCard({ product, locale, ui }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="block">
    <article className="group overflow-hidden rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/96 shadow-[0_14px_40px_rgba(28,25,23,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(28,25,23,0.12)]">
      <div className={`relative flex aspect-[4/3] items-center justify-center border-b border-white/60 bg-gradient-to-br ${product.gradientClass}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
        <span className="text-7xl drop-shadow-md transition-transform duration-500 group-hover:scale-110">
          {product.imageEmoji}
        </span>
        {product.bestSeller && (
          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] shadow-sm backdrop-blur-sm">
            {ui.bestSellerBadge}
          </span>
        )}
      </div>

      <div className="space-y-4 p-6 text-center">
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
              {product.name[locale]}
            </h3>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">{ui.startingAtLabel}</p>
            <span className="inline-flex rounded-full border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
              {formatPriceCop(getProductStartingPriceCop(product), locale)}
            </span>
          </div>
          <div className="border-t border-[var(--color-primary-pale)] pt-4 text-sm font-semibold text-[var(--color-primary)] transition-all group-hover:translate-x-1">
            {ui.viewDetailsLabel} →
          </div>
        </div>
      </div>
    </article>
    </Link>
  );
}
