"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { formatPriceCop, getProductBySlug } from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";

type CartPageExperienceProps = {
  locale: Locale;
  ui: LandingDictionary["cartUi"];
};

export default function CartPageExperience({ locale, ui }: CartPageExperienceProps) {
  const { items, subtotalCop, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="bg-[var(--color-cream)] py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/90 p-10 text-center shadow-[0_24px_70px_rgba(28,25,23,0.08)]">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{ui.emptyTitle}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">{ui.emptyBody}</p>
            <Link href="/order" className="mt-8 inline-flex rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-95">
              {ui.continueShoppingLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-cream)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">{ui.summaryTitle}</p>
            <h1 className="mt-3 text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-5xl">
              {ui.title} <span className="italic text-[var(--color-primary)]">{ui.accent}</span>
            </h1>
          </div>
          <button type="button" onClick={clearCart} className="text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-80">
            {ui.clearCartLabel}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {items.map((item) => {
              const product = getProductBySlug(item.productSlug);

              return (
                <article key={item.id} className="grid gap-6 rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_18px_48px_rgba(28,25,23,0.08)] md:grid-cols-[160px_1fr]">
                  <div className={`flex aspect-square items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${item.productGradientClass}`}>
                    <span className="text-6xl">{item.productEmoji}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{item.productName}</h2>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">{formatPriceCop(item.unitPriceCop, locale)}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-80">
                        {ui.removeLabel}
                      </button>
                    </div>

                    {product ? (
                      <div className="flex flex-wrap gap-2">
                        {product.optionGroups.flatMap((group) =>
                          (item.selections[group.key] ?? []).map((choiceKey) => {
                            const choice = group.choices.find((entry) => entry.key === choiceKey);
                            if (!choice || choice.key === "none") return null;
                            return (
                              <span key={`${group.key}-${choice.key}`} className="rounded-full border border-[var(--color-primary-light)] bg-[var(--color-primary-pale)] px-3 py-1 text-xs text-[var(--color-primary)]">
                                {choice.label[locale]}
                              </span>
                            );
                          }),
                        )}
                      </div>
                    ) : null}

                    {item.note ? (
                      <p className="text-sm text-[var(--color-muted)]"><span className="font-semibold text-[var(--color-dark)]">{ui.noteLabel}:</span> {item.note}</p>
                    ) : null}

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--color-dark)]">{ui.quantityLabel}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)]">−</button>
                      <span className="min-w-6 text-center font-semibold text-[var(--color-dark)]">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)]">+</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/94 p-6 shadow-[0_18px_48px_rgba(28,25,23,0.08)] lg:sticky lg:top-28 space-y-6">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{ui.summaryTitle}</h2>

            <div className="border-t border-[var(--color-primary-pale)] pt-4 flex items-center justify-between text-base text-[var(--color-muted)]">
              <span>{ui.subtotalLabel}</span>
              <span className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{formatPriceCop(subtotalCop, locale)}</span>
            </div>

            <Link href="/checkout" className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-4 text-base font-semibold text-white transition-all hover:brightness-95">
              {ui.checkoutLabel}
            </Link>
            <Link href="/order" className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-primary-light)] px-6 py-4 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]">
              {ui.continueShoppingLabel}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
