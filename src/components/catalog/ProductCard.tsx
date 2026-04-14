import Link from "next/link";

import { formatPriceCop, getProductStartingPriceCop, type CatalogProduct } from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";
import { WishlistHeart } from "@/components/catalog/WishlistHeart";

type ProductCardProps = {
  product: CatalogProduct;
  locale: Locale;
  ui: LandingDictionary["catalogUi"];
};

export default function ProductCard({ product, locale, ui }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${product.gradientClass}`}>
        <div className="absolute right-3 top-3 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <WishlistHeart slug={product.slug} size="sm" />
        </div>

        {product.bestSeller && (
          <span className="absolute left-3 top-3 z-20 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-dark)] backdrop-blur-md">
            {ui.bestSellerBadge}
          </span>
        )}

        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />

        {product.imagePath ? (
          <img
            src={product.imagePath}
            alt={product.name[locale]}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-sm transition-transform duration-700 ease-out group-hover:scale-105">
            {product.imageEmoji}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold font-[family-name:var(--font-playfair)] leading-snug text-[var(--color-dark)]">
          {product.name[locale]}
        </h3>
        <p className="text-xs font-semibold text-[var(--color-dark)]">
          {formatPriceCop(getProductStartingPriceCop(product), locale)}
        </p>
      </div>
    </Link>
  );
}
