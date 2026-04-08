"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useCart } from "@/components/cart/CartProvider";
import { createCartItem } from "@/lib/cart";
import { formatPriceCop, type CatalogProductDetail } from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";
import { calculateProductPrice, getDefaultSelections, type ProductSelections } from "@/lib/pricing";
import { isSameDayEligible, type CheckoutDeliveryMethod } from "@/lib/checkout";
import type { AutoBuyConfig, AutoBuyFrequency } from "@/components/checkout/AutoBuyModal";

type ProductDetailExperienceProps = {
  product: CatalogProductDetail;
  locale: Locale;
  ui: LandingDictionary["productUi"];
  checkoutUi: LandingDictionary["checkoutUi"];
};

export default function ProductDetailExperience({ product, locale, ui, checkoutUi }: ProductDetailExperienceProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [selections, setSelections] = useState<ProductSelections>(() => getDefaultSelections(product));
  const [note, setNote] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [hasPassport, setHasPassport] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<CheckoutDeliveryMethod>("standard");
  const [userHasActivePassport, setUserHasActivePassport] = useState(false);
  const [autoBuyConfig, setAutoBuyConfig] = useState<AutoBuyConfig>({ 
    enabled: false, 
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    quantity: 1,
    type: "autoorder"
  });

  const sameDayAvailable = useMemo(() => isSameDayEligible(), []);

  useEffect(() => {
    const saved = localStorage.getItem("cart-delivery-method");
    if (saved) {
      setDeliveryMethod(saved as CheckoutDeliveryMethod);
    }
    
    const savedPassport = localStorage.getItem("cart-passport-selected");
    if (savedPassport === "true") {
      setHasPassport(true);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/passport")
        .then(res => res.json())
        .then(data => {
          if (data.data?.status === "ACTIVE") {
            setUserHasActivePassport(true);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const handleDeliveryMethodChange = (method: CheckoutDeliveryMethod) => {
    setDeliveryMethod(method);
    localStorage.setItem("cart-delivery-method", method);
  };
  
  const handlePassportChange = (checked: boolean) => {
    setHasPassport(checked);
    localStorage.setItem("cart-passport-selected", checked.toString());
  };

  const paletteGroup = product.optionGroups.find((group) => group.key === "palette");
  const configurationGroup = product.optionGroups.find((group) => group.key === "configuration");
  const customizationGroups = product.optionGroups.filter((group) => group.key !== "palette" && group.key !== "delivery");
  const extraGroups = customizationGroups.filter((group) => group.key !== "configuration");
  const selectedPaletteKey = (selections.palette ?? [paletteGroup?.choices[0]?.key ?? ""])[0];
  const cardSelected = (selections.card ?? []).length > 0;
  const selectedConfigurationKey = (selections.configuration ?? [configurationGroup?.choices[0]?.key ?? "basic"])[0];

  const priceSummary = useMemo(() => calculateProductPrice(product, selections, locale), [locale, product, selections]);
  
  const subtotalWithoutDelivery = useMemo(() => {
    return priceSummary.totalCop - (priceSummary.lines.find(line => line.groupKey === "delivery")?.amountCop ?? 0);
  }, [priceSummary]);

  const isDeliveryFree = subtotalWithoutDelivery >= 100 || userHasActivePassport || hasPassport;

  const selectedLabels = useMemo(() => {
    return product.optionGroups.flatMap((group) => {
      if (group.key === "palette" || group.key === "delivery" || group.key === "configuration") {
        return [];
      }

      const selectedKeys = selections[group.key] ?? [];

      return selectedKeys
        .map((selectedKey) => group.choices.find((choice) => choice.key === selectedKey))
        .filter((choice) => Boolean(choice) && choice?.key !== "none")
        .map((choice) => choice?.label[locale])
        .filter((value): value is string => Boolean(value));
    });
  }, [locale, product.optionGroups, selections]);

  const getPalettePreviewClass = (paletteKey: string) => {
    switch (paletteKey) {
      case "pink":
        return "from-rose-200 via-pink-100 to-rose-50";
      case "white":
        return "from-stone-100 via-white to-zinc-50";
      case "red":
        return "from-rose-300 via-red-200 to-rose-100";
      case "yellow":
        return "from-yellow-100 via-amber-50 to-orange-50";
      case "purple":
        return "from-violet-100 via-fuchsia-50 to-rose-50";
      case "peach":
        return "from-orange-100 via-rose-50 to-amber-50";
      case "green":
        return "from-emerald-100 via-lime-50 to-stone-50";
      case "blue":
        return "from-sky-100 via-blue-50 to-violet-50";
      default:
        return product.gradientClass;
    }
  };

  const activeGradientClass = getPalettePreviewClass(selectedPaletteKey);

  const setSingleSelection = (groupKey: string, choiceKey: string, required = false) => {
    setSelections((current) => {
      const currentValue = current[groupKey] ?? [];
      const isSelected = currentValue[0] === choiceKey;

      if (!required && isSelected) {
        return { ...current, [groupKey]: [] };
      }

      return { ...current, [groupKey]: [choiceKey] };
    });
  };

  const applyConfiguration = (choiceKey: string) => {
    const choice = configurationGroup?.choices.find((entry) => entry.key === choiceKey);

    if (!choice) {
      return;
    }

    setSelections((current) => ({
      ...current,
      configuration: [choice.key],
      chocolates: choice.presetSelections?.chocolates ?? current.chocolates ?? [],
      "self-care": choice.presetSelections?.["self-care"] ?? current["self-care"] ?? [],
      card: choice.presetSelections?.card ?? current.card ?? [],
    }));
  };

  const toggleMultiSelection = (groupKey: string, choiceKey: string) => {
    setSelections((current) => {
      const currentValues = current[groupKey] ?? [];
      return {
        ...current,
        [groupKey]: currentValues.includes(choiceKey)
          ? currentValues.filter((value) => value !== choiceKey)
          : [...currentValues, choiceKey],
      };
    });
  };

  const handleAddToCart = () => {
    addItem(createCartItem(product, selections, cardSelected ? note : "", locale));
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(createCartItem(product, selections, cardSelected ? note : "", locale));
    router.push("/checkout");
  };

  return (
    <section className="bg-[var(--color-cream)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/order" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-80">
          ← {ui.backToCatalogLabel}
        </Link>

        <div className="mt-6 grid gap-5 min-[900px]:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_280px] 2xl:items-start">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.25rem] border border-[var(--color-primary-light)]/70 bg-white/92 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
              <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${activeGradientClass}`}>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
                <span className="relative text-[4rem] drop-shadow-lg md:text-[5rem]">{product.imageEmoji}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {paletteGroup?.choices.map((choice, index) => {
                const selected = choice.key === selectedPaletteKey || (!selectedPaletteKey && index === 0);

                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => setSingleSelection("palette", choice.key, true)}
                    className={`space-y-1 rounded-[0.9rem] border p-1.5 text-center transition-all ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white hover:border-[var(--color-primary)]/60"}`}
                  >
                    <div className={`flex aspect-square items-center justify-center rounded-[0.75rem] bg-gradient-to-br ${getPalettePreviewClass(choice.key)}`}>
                      <span className="text-2xl">{product.imageEmoji}</span>
                    </div>
                    <span className="block text-[11px] font-medium text-[var(--color-dark)]">{choice.label[locale]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-[var(--color-primary-light)]/70 bg-white/94 p-5 shadow-[0_16px_38px_rgba(28,25,23,0.08)] md:p-6 min-[900px]:col-span-1 2xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">{ui.startingAtLabel}</p>
            <h1 className="mt-2 text-3xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-[2.1rem]">{product.name[locale]}</h1>
            <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{formatPriceCop(priceSummary.totalCop, locale)}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{product.longDescription[locale]}</p>

            <div className="mt-6 space-y-5 border-t border-[var(--color-primary-pale)] pt-5">
              <div className="space-y-5">
                {configurationGroup ? (
                  <section className="space-y-3 border-t border-[var(--color-primary-light)]/60 pt-6 first:border-t-0 first:pt-0">
                    <div className="pb-1">
                      <h3 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{configurationGroup.label[locale]}</h3>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                      {configurationGroup.choices.map((choice) => {
                        const selected = selectedConfigurationKey === choice.key;

                        return (
                          <button
                            key={choice.key}
                            type="button"
                            onClick={() => applyConfiguration(choice.key)}
                            className={`rounded-[0.95rem] border px-4 py-3 text-center transition-all ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)] shadow-[0_8px_20px_rgba(28,25,23,0.07)]" : "border-[var(--color-primary-light)]/70 bg-white hover:border-[var(--color-primary)]/60"}`}
                          >
                            <div className="space-y-1 text-center">
                              <span className="block text-base font-semibold text-[var(--color-dark)]">{choice.label[locale]}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                  <section className="space-y-3 border-t border-[var(--color-primary-light)]/60 pt-5">
                    <div>
                    <h3 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                       {locale === "es" ? "Productos incluidos y extras" : "Included products & extras"}
                     </h3>
                    </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                    {extraGroups.flatMap((group) =>
                      group.choices.map((choice) => {
                        const selected = (selections[group.key] ?? []).includes(choice.key);

                        return (
                          <button
                            key={`${group.key}-${choice.key}`}
                            type="button"
                            onClick={() => {
                              if (group.inputType === "multi") {
                                toggleMultiSelection(group.key, choice.key);
                                return;
                              }

                              setSingleSelection(group.key, choice.key, group.required);
                            }}
                            className={`rounded-[1rem] border p-2 text-left transition-all ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)] shadow-[0_8px_18px_rgba(28,25,23,0.06)]" : "border-[var(--color-primary-light)]/70 bg-white hover:border-[var(--color-primary)]/60"}`}
                          >
                            <div className="space-y-2.5">
                              <div
                                className="relative h-24 rounded-[0.85rem] bg-cover bg-center"
                                style={choice.imageUrl ? { backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), url('${choice.imageUrl}')` } : undefined}
                              >
                                <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-white/88 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                  {group.key === "card" ? "Card" : group.label[locale]}
                                </span>
                              </div>
                              <div className="space-y-1 text-center px-1 pb-1">
                                <span className="block text-xs font-semibold text-[var(--color-dark)]">{choice.label[locale]}</span>
                                <span className="block text-xs font-semibold text-[var(--color-primary)]">
                                  {choice.priceDeltaCop === 0 ? checkoutUi.deliveryPriceFree : `+ ${formatPriceCop(choice.priceDeltaCop, locale)}`}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      }),
                    )}
                  </div>
                </section>

                <div className="space-y-2 border-t border-[var(--color-primary-light)]/60 pt-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]" htmlFor="gift-note">
                    {ui.noteLabel}
                  </label>
                  <textarea
                    id="gift-note"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={cardSelected ? ui.notePlaceholder : locale === "es" ? "Selecciona primero la tarjeta si quieres escribir un mensaje" : "Select the card first if you want to write a message"}
                    disabled={!cardSelected}
                    className="w-full resize-none rounded-[0.85rem] border border-[var(--color-primary-light)]/75 bg-white px-4 py-3 text-sm outline-none transition-all disabled:cursor-not-allowed disabled:bg-[var(--color-primary-pale)]/50 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[1.1rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-4 shadow-[0_16px_38px_rgba(28,25,23,0.08)] min-[900px]:col-span-2 2xl:col-span-1 2xl:col-start-3 2xl:sticky 2xl:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{ui.priceSummaryLabel}</p>
            <p className="mt-2 text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{formatPriceCop(priceSummary.totalCop, locale)}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{ui.basePriceLabel}: {formatPriceCop(priceSummary.basePriceCop, locale)}</p>

            <div className="mt-4 space-y-3 border-t border-[var(--color-primary-pale)] pt-3">
              <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-3">
                <label htmlFor="delivery-method-product" className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
                  {checkoutUi.deliveryMethodLabel}
                </label>
                <select
                  id="delivery-method-product"
                  value={deliveryMethod}
                  onChange={(e) => handleDeliveryMethodChange(e.target.value as CheckoutDeliveryMethod)}
                  className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-3 py-2 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                >
                  <option value="pickup">{checkoutUi.deliveryMethodPickup} - {checkoutUi.deliveryPriceFree}</option>
                  <option value="standard">
                    {checkoutUi.deliveryMethodStandard} - {isDeliveryFree ? checkoutUi.deliveryPriceFree : (session?.user ? `${checkoutUi.deliveryPriceMemberDiscount} (+$3)` : "+$4")}
                  </option>
                  <option value="tomorrow">
                    {checkoutUi.deliveryMethodTomorrow} - {isDeliveryFree ? checkoutUi.deliveryPriceFree : (session?.user ? `${checkoutUi.deliveryPriceMemberDiscount} (+$5)` : "+$7")}
                  </option>
                  {sameDayAvailable && (
                    <option value="today">
                      {checkoutUi.deliveryMethodToday} - {isDeliveryFree ? checkoutUi.deliveryPriceFree : (session?.user ? `${checkoutUi.deliveryPriceMemberDiscount} (+$7)` : "+$10")}
                    </option>
                  )}
                </select>
              </div>

              <div className="rounded-xl border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-3">
                <label htmlFor="passport-checkbox-product" className="flex items-start gap-3 cursor-pointer">
                  <div className="flex h-5 items-center">
                    <input
                      id="passport-checkbox-product"
                      type="checkbox"
                      checked={hasPassport}
                      onChange={(e) => handlePassportChange(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--color-dark)]">
                      {checkoutUi.passportCheckboxLabel}
                    </span>
                    <span className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
                      {checkoutUi.passportDescription}
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        PROMO
                      </span>
                      <span className="text-sm font-bold text-[var(--color-dark)]">{checkoutUi.passportPromoPrice}</span>
                      <span className="text-xs text-[var(--color-muted)] line-through">{checkoutUi.passportRegularPrice}</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="rounded-xl border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-4">
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-[var(--color-dark)]">
                    Auto-Buy
                  </span>
                  <span className="block text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                    Choose how often you want to receive this order automatically.
                  </span>
                </label>
                <select
                  value={autoBuyConfig.enabled ? autoBuyConfig.frequency : "none"}
                  onChange={(e) => {
                    if (e.target.value === "none") {
                      setAutoBuyConfig({ 
                        enabled: false, 
                        frequency: "monthly",
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
                        quantity: 1,
                        type: "autoorder"
                      });
                    } else {
                      setAutoBuyConfig({
                        enabled: true,
                        frequency: e.target.value as AutoBuyFrequency,
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
                        quantity: 1,
                        type: "autoorder"
                      });
                    }
                  }}
                  className="mt-2 block w-full rounded-lg border border-[var(--color-primary-light)] bg-white px-3 py-2 text-sm text-[var(--color-dark)] shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                >
                  <option value="none">No Auto-Buy</option>
                  <option value="weekly">Weekly (Semanal)</option>
                  <option value="monthly">Monthly (Mensual)</option>
                  <option value="quarterly">Every 3 Months (Cada 3 Meses)</option>
                  <option value="annually">Once a Year (Una Vez al Año)</option>
                </select>
              </div>
            </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-95"
              >
                {addedFeedback ? ui.addedToCartLabel : ui.addToCartLabel}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[var(--color-primary-light)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
              >
                {ui.buyNowLabel}
              </button>

            <div className="mt-4 space-y-2 border-t border-[var(--color-primary-pale)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{ui.includesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => (
                  <span key={label} className="rounded-full border border-[var(--color-primary-light)] bg-[var(--color-primary-pale)] px-3 py-1 text-xs text-[var(--color-primary)]">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {priceSummary.lines.length > 0 ? (
                <div className="mt-3 space-y-2 border-t border-[var(--color-primary-pale)] pt-3">
                  {priceSummary.lines.map((line) => (
                    <div key={`${line.groupKey}-${line.choiceKey}`} className="flex items-center justify-between gap-4 text-xs text-[var(--color-muted)]">
                      <span>{line.label}</span>
                    <span>+ {formatPriceCop(line.amountCop, locale)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
