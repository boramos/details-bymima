"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { AutoBuyConfig } from "./AutoBuyModal";

import { useCart } from "@/components/cart/CartProvider";
import { formatCheckoutTotal, isSameDayEligible, type CheckoutDeliveryMethod, type CheckoutDraftItem, type CheckoutQuote } from "@/lib/checkout";
import type { LandingDictionary, Locale } from "@/lib/i18n";

type CheckoutPageExperienceProps = {
  locale: Locale;
  ui: LandingDictionary["checkoutUi"];
  cartUi: LandingDictionary["cartUi"];
};

type PaymentMethod = "card" | "paypal";

export default function CheckoutPageExperience({ locale, ui, cartUi }: CheckoutPageExperienceProps) {
  const { items, removeItem, updateQuantity } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<CheckoutDeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPassport, setHasPassport] = useState(false);
  const { data: session } = useSession();
  const [autoBuyConfig, setAutoBuyConfig] = useState<AutoBuyConfig>({ 
    enabled: false, 
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    quantity: 1,
    type: "autoorder"
  });
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
    paypalEmail: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("cart-delivery-method");
    if (saved) {
      const nextMethod = saved as CheckoutDeliveryMethod;
      setDeliveryMethod(nextMethod === "today" && !isSameDayEligible() ? "standard" : nextMethod);
    }
    
    const savedPassport = localStorage.getItem("cart-passport-selected");
    if (savedPassport === "true") {
      setHasPassport(true);
    }
  }, []);

  const draftItems = useMemo<CheckoutDraftItem[]>(() => items.map((item) => ({
    productSlug: item.productSlug,
    quantity: item.quantity,
    selections: item.selections,
    note: item.note,
  })), [items]);
  const [sameDayAvailable, setSameDayAvailable] = useState(() => isSameDayEligible());

  useEffect(() => {
    setSameDayAvailable(isSameDayEligible());

    const interval = window.setInterval(() => {
      setSameDayAvailable(isSameDayEligible());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (deliveryMethod === "today" && !sameDayAvailable) {
      setDeliveryMethod("standard");
      localStorage.setItem("cart-delivery-method", "standard");
    }
  }, [deliveryMethod, sameDayAvailable]);

  useEffect(() => {
    if (draftItems.length === 0) {
      setQuote(null);
      return;
    }

    const run = async () => {
      setLoadingQuote(true);
      setError(null);

      try {
        const response = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale, items: draftItems, deliveryMethod, hasPassport }),
        });

        const data = await response.json() as { quote?: CheckoutQuote; error?: string };

        if (!response.ok || !data.quote) {
          throw new Error(data.error ?? "Unable to generate quote");
        }

        setQuote(data.quote);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to generate quote");
      } finally {
        setLoadingQuote(false);
      }
    };

    void run();
  }, [deliveryMethod, draftItems, locale, hasPassport]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCheckout = async () => {
    if (!quote) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const route = paymentMethod === "card"
        ? "/api/checkout/stripe/session"
        : "/api/checkout/paypal/order";

      const response = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: draftItems,
          deliveryMethod,
          hasPassport,
          customer: {
            email: form.email,
            name: form.name,
            phone: "",
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
          },
        }),
      });

      const data = await response.json() as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to continue to payment");
      }

      window.location.href = data.url;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to continue to payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="bg-[var(--color-cream)] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-8 text-center shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
            <p className="text-[var(--color-muted)]">{ui.missingCartLabel}</p>
            <Link href="/order" className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">
              {cartUi.continueShoppingLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-cream)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-5xl">
            {ui.title} <span className="italic text-[var(--color-primary)]">{ui.accent}</span>
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
              <h2 className="text-xl font-semibold text-[var(--color-dark)]">{ui.customerTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder={ui.emailLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder={ui.nameLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                {deliveryMethod !== "pickup" ? (
                  <>
                    <input value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder={ui.addressLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder={ui.cityLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} placeholder={ui.postalCodeLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                  </>
                ) : null}
              </div>
            </section>

            

            <section className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
              <h2 className="text-xl font-semibold text-[var(--color-dark)]">{ui.paymentTitle}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button type="button" onClick={() => setPaymentMethod("card")} className={`rounded-xl border px-4 py-4 text-left ${paymentMethod === "card" ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white"}`}>
                  <p className="font-semibold text-[var(--color-dark)]">{ui.cardMethodLabel}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{ui.cardDescription}</p>
                </button>
                <button type="button" onClick={() => setPaymentMethod("paypal")} className={`rounded-xl border px-4 py-4 text-left ${paymentMethod === "paypal" ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white"}`}>
                  <p className="font-semibold text-[var(--color-dark)]">{ui.paypalMethodLabel}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{ui.paypalDescription}</p>
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {paymentMethod === "card" ? (
                  <>
                    <input value={form.cardNumber} onChange={(e) => setField("cardNumber", e.target.value)} placeholder={ui.cardNumberLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input value={form.cardName} onChange={(e) => setField("cardName", e.target.value)} placeholder={ui.cardNameLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input value={form.cardExpiry} onChange={(e) => setField("cardExpiry", e.target.value)} placeholder={ui.cardExpiryLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input value={form.cardCvc} onChange={(e) => setField("cardCvc", e.target.value)} placeholder={ui.cardCvcLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                  </>
                ) : (
                  <input value={form.paypalEmail} onChange={(e) => setField("paypalEmail", e.target.value)} placeholder={ui.paypalEmailLabel} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)] lg:sticky lg:top-28">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{ui.summaryTitle}</h2>
            {loadingQuote ? <p className="mt-4 text-sm text-[var(--color-muted)]">{ui.loadingQuoteLabel}</p> : null}
            {quote ? (
              <div className="mt-5 space-y-4">
                {quote.items.map((item) => (
                  <div key={`${item.productSlug}-${item.note}`} className="space-y-1 border-b border-[var(--color-primary-pale)] pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-medium text-[var(--color-dark)]">{item.productName} × {item.quantity}</span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const cartItem = items.find((entry) => entry.productSlug === item.productSlug && entry.note === item.note);

                            if (!cartItem) {
                              return null;
                            }

                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)]"
                                >
                                  −
                                </button>
                                <span className="min-w-5 text-center text-xs font-semibold text-[var(--color-dark)]">{cartItem.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)]"
                                >
                                  +
                                </button>
                              </>
                            );
                          })()}
                          <button
                            type="button"
                            onClick={() => {
                              const cartItem = items.find((entry) => entry.productSlug === item.productSlug && entry.note === item.note);
                              if (cartItem) removeItem(cartItem.id);
                            }}
                            className="text-xs font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-80"
                          >
                            {cartUi.removeLabel}
                          </button>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-primary)]">{formatCheckoutTotal(item.lineTotal, locale)}</span>
                    </div>
                  </div>
                ))}

                {!hasPassport && (
                  <div className="mb-4">
                    <div className="rounded-xl border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-4">
                      <label htmlFor="passport-checkbox" className="flex items-start gap-3 cursor-pointer">
                        <div className="flex h-5 items-center">
                          <input
                            id="passport-checkbox"
                            type="checkbox"
                            checked={hasPassport}
                            onChange={(e) => setHasPassport(e.target.checked)}
                            className="h-4 w-4 rounded border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[var(--color-dark)]">
                              {ui.passportCheckboxLabel}
                            </span>
                            <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                              PROMO
                            </span>
                            <span className="text-xs font-bold text-[var(--color-primary)]">{ui.passportPromoPrice}</span>
                            <span className="text-[10px] text-[var(--color-muted)] line-through">{ui.passportRegularPrice}</span>
                          </div>
                          <span className="text-[10px] text-[var(--color-muted)] leading-tight">
                            {ui.passportDescription}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="mb-4 rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{ui.deliveryMethodLabel}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
                        {deliveryMethod === "pickup" && ui.deliveryMethodPickup}
                        {deliveryMethod === "standard" && ui.deliveryMethodStandard}
                        {deliveryMethod === "tomorrow" && ui.deliveryMethodTomorrow}
                        {deliveryMethod === "today" && sameDayAvailable && ui.deliveryMethodToday}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--color-primary)]">
                        {deliveryMethod === "pickup" && ui.deliveryPriceFree}
                        {deliveryMethod !== "pickup" && (quote?.deliveryFee === 0 || hasPassport ? ui.deliveryPriceFree : formatCheckoutTotal(quote?.deliveryFee ?? 0, locale))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[var(--color-primary-pale)] pt-3 text-sm text-[var(--color-muted)]">
                  <div className="flex items-center justify-between"><span>{cartUi.subtotalLabel}</span><span>{formatCheckoutTotal(quote.subtotal, locale)}</span></div>
                  <div className="flex items-center justify-between"><span>{ui.taxesLabel}</span><span>{formatCheckoutTotal(quote.taxes, locale)}</span></div>
                  {hasPassport ? (
                    <div className="flex items-center justify-between">
                      <span>{ui.passportTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="line-through opacity-50">{ui.passportRegularPrice}</span>
                        <span className="font-semibold text-[var(--color-primary)]">{ui.passportPromoPrice}</span>
                      </div>
                    </div>
                  ) : null}
                  {quote.deliveryMethod !== "pickup" ? (
                    <div className="flex items-center justify-between"><span>{ui.deliveryTitle}</span><span>{hasPassport || quote.deliveryFee === 0 ? ui.deliveryPriceFree : formatCheckoutTotal(quote.deliveryFee, locale)}</span></div>
                  ) : null}
                  <div className="flex items-center justify-between text-base font-semibold text-[var(--color-dark)]">
                    <span>{ui.totalLabel}</span>
                    <span>{formatCheckoutTotal(quote.total + (hasPassport ? 19.99 : 0) - (hasPassport && quote.deliveryMethod !== "pickup" ? quote.deliveryFee : 0), locale)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={!quote || submitting || loadingQuote}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? ui.loadingQuoteLabel : paymentMethod === "card" ? ui.payWithCardLabel : ui.payWithPaypalLabel}
            </button>

            <p className="mt-4 text-xs text-[var(--color-muted)]">{ui.checkoutDisclaimer}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
