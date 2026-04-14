"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useCart } from "@/components/cart/CartProvider";
import { createCartItem } from "@/lib/cart";
import { formatPriceCop, type CatalogProductDetail } from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";
import { calculateProductPrice, getDefaultSelections, type ProductSelections } from "@/lib/pricing";
import { isSameDayEligible, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { AutoBuyModal, type AutoBuyConfig } from "@/components/checkout/AutoBuyModal";
import { WishlistHeart } from "@/components/catalog/WishlistHeart";

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
  const [isDeliverySelectorOpen, setIsDeliverySelectorOpen] = useState(false);
  const [userHasActivePassport, setUserHasActivePassport] = useState(false);
  const [showAutoBuyModal, setShowAutoBuyModal] = useState(false);
  const [autoBuyConfig, setAutoBuyConfig] = useState<AutoBuyConfig>({ 
    enabled: false, 
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    quantity: 1,
    type: "autoorder"
  });

  const [sameDayAvailable, setSameDayAvailable] = useState(() => isSameDayEligible());
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

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
    if (session?.user?.id) {
      fetch("/api/passport")
        .then(res => res.json())
        .then(data => {
          if (data.isActive) {
            setUserHasActivePassport(true);
            setHasPassport(false);
            localStorage.setItem("cart-passport-selected", "false");
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const handleDeliveryMethodChange = (method: CheckoutDeliveryMethod) => {
    const nextMethod = method === "today" && !sameDayAvailable ? "standard" : method;
    setDeliveryMethod(nextMethod);
    localStorage.setItem("cart-delivery-method", nextMethod);
    setIsDeliverySelectorOpen(false);
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

  const getPaletteSwatchColor = (paletteKey: string) => {
    switch (paletteKey) {
      case "pink":
        return "bg-pink-400";
      case "white":
        return "bg-white";
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-400";
      case "purple":
        return "bg-violet-500";
      case "peach":
        return "bg-orange-300";
      case "green":
        return "bg-emerald-500";
      case "blue":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

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

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const displayImages = product.imagePaths?.length ? product.imagePaths : (product.imagePath ? [product.imagePath] : []);
  const activeImagePath = displayImages[selectedImageIndex] || product.imagePath;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const [zoom, setZoom] = useState({ show: false, showPanel: false, x: 0, y: 0 });
  const [isZoomActive, setIsZoomActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomActive) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    const viewportWidth = window.innerWidth;
    const panelWidth = 500;
    const panelGap = 20;
    const availableRightSpace = viewportWidth - (left + width);
    const showPanel = availableRightSpace >= panelWidth + panelGap;

    setZoom({ show: true, showPanel, x, y });
  };

  const handleMouseLeave = () => {
    setIsZoomActive(false);
    setZoom({ show: false, showPanel: false, x: 0, y: 0 });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsZoomActive((prev) => {
      const next = !prev;
      if (!next) setZoom({ show: false, showPanel: false, x: 0, y: 0 });
      return next;
    });
  };

  const activeGradientClass = getPalettePreviewClass(selectedPaletteKey);

  const formatDeliveryDate = (daysToAdd: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(targetDate);
  };

  const getDeliveryPriceValueText = (method: CheckoutDeliveryMethod) => {
    if (method === "pickup" || isDeliveryFree) {
      return checkoutUi.deliveryPriceFree;
    }

    if (method === "standard") {
      return session?.user ? "US$3" : "US$4";
    }

    if (method === "tomorrow") {
      return session?.user ? "US$5" : "US$7";
    }

    return session?.user ? "US$7" : "US$10";
  };

  const getDeliveryFeeBadgeText = (method: CheckoutDeliveryMethod) => {
    if (method === "pickup") {
      return "Free - Pickup";
    }

    if (isDeliveryFree) {
      return "Free - Shipping";
    }

    return `${getDeliveryPriceValueText(method)} - Shipping`;
  };

  const deliveryOptions = [
    {
      method: "standard" as const,
      label: checkoutUi.deliveryMethodStandard,
      dateLabel: formatDeliveryDate(2),
    },
    {
      method: "tomorrow" as const,
      label: checkoutUi.deliveryMethodTomorrow,
      dateLabel: formatDeliveryDate(1),
    },
    ...(sameDayAvailable
      ? [{ method: "today" as const, label: checkoutUi.deliveryMethodToday, dateLabel: formatDeliveryDate(0) }]
      : []),
    {
      method: "pickup" as const,
      label: checkoutUi.deliveryMethodPickup,
      dateLabel: locale === "es" ? "hoy" : "today",
    },
  ];

  const selectedDeliveryOption = deliveryOptions.find((option) => option.method === deliveryMethod) ?? deliveryOptions[0];

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
    const draftItem: CheckoutDraftItem = {
      productSlug: product.slug,
      quantity: 1,
      selections,
      note: cardSelected ? note : "",
    };
    sessionStorage.setItem("buy-now-item", JSON.stringify(draftItem));
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
            {paletteGroup && paletteGroup.choices.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {paletteGroup.choices.map((choice, index) => {
                  const selected = choice.key === selectedPaletteKey || (!selectedPaletteKey && index === 0);

                  return (
                    <button
                      key={choice.key}
                      type="button"
                      onClick={() => setSingleSelection("palette", choice.key, true)}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <div 
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                          selected 
                            ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-cream)] scale-110" 
                            : "ring-1 ring-black/5 hover:ring-2 hover:ring-[var(--color-primary-light)] hover:scale-105"
                        }`}
                      >
                        <div className={`h-full w-full rounded-full ${getPaletteSwatchColor(choice.key)} border border-black/10`} />
                      </div>
                      <span className={`block text-[11px] font-medium transition-colors ${
                        selected ? "text-[var(--color-primary)]" : "text-[var(--color-muted)] group-hover:text-[var(--color-dark)]"
                      }`}>
                        {choice.label[locale]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="relative" ref={imageWrapperRef}>
              <div 
                className="relative overflow-hidden bg-white/92 shadow-sm"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className={`group relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br ${activeGradientClass}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
                  {activeImagePath ? (
                    <img src={activeImagePath} alt={product.name[locale]} className={`relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isZoomActive ? "cursor-crosshair" : "cursor-default"}`} />
                  ) : (
                    <span className="relative text-[4rem] drop-shadow-lg transition-transform duration-700 ease-out group-hover:scale-110 md:text-[5rem]">{product.imageEmoji}</span>
                  )}

                  <button
                    onClick={toggleZoom}
                    className={`absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center shadow-sm backdrop-blur-sm transition-all focus:outline-none ${isZoomActive ? "bg-[var(--color-primary)] text-white" : "bg-white/80 text-[var(--color-dark)] hover:scale-105 hover:bg-white"}`}
                    aria-label="Toggle zoom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>

                  {displayImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white/80 text-[var(--color-dark)] shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus:outline-none"
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      <button 
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white/80 text-[var(--color-dark)] shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus:outline-none"
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>

                      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 bg-white/80 px-2 py-1.5 shadow-sm backdrop-blur-sm">
                        {displayImages.map((_: string, idx: number) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all ${idx === selectedImageIndex ? "w-3 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-primary-light)]/60"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {displayImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {displayImages.map((imgPath: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx 
                          ? "border-[var(--color-primary)]" 
                          : "border-transparent hover:border-[var(--color-primary-light)]"
                      }`}
                    >
                      <img src={imgPath} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {zoom.show && zoom.showPanel && activeImagePath && (
                <div className="pointer-events-none absolute left-[calc(100%+20px)] top-0 z-50 hidden h-[600px] w-[600px] overflow-hidden border-2 border-white bg-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5 min-[900px]:block transition-opacity duration-200">
                  <div 
                    className={`h-full w-full bg-gradient-to-br ${activeGradientClass} transition-transform duration-75`}
                    style={{
                      backgroundImage: `url(${activeImagePath})`,
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                      backgroundSize: "250%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] mix-blend-overlay"></div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-[var(--color-primary-light)]/70 bg-white/94 p-5 shadow-sm md:p-6 min-[900px]:col-span-1 2xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">{ui.startingAtLabel}</p>
            <div className="flex items-start gap-3">
              <h1 className="mt-2 text-3xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] md:text-[2.1rem]">{product.name[locale]}</h1>
              <WishlistHeart slug={product.slug} size="md" />
            </div>
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
                            className={`border px-4 py-3 text-center transition-all ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)] shadow-sm" : "border-[var(--color-primary-light)]/70 bg-white hover:border-[var(--color-primary)]/60"}`}
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
                            className="text-left transition-all"
                          >
                            <div
                              className={`relative aspect-square overflow-hidden bg-cover bg-center border ${selected ? "border-[var(--color-primary)]" : "border-transparent"}`}
                              style={choice.imageUrl ? { backgroundImage: `url('${choice.imageUrl}')` } : undefined}
                            >
                              <span className="absolute left-1/2 top-2 -translate-x-1/2 bg-white/88 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                {group.key === "card" ? "Card" : group.label[locale]}
                              </span>
                              {!choice.imageUrl && (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary-pale)]/40">
                                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                    {group.key === "card" ? "Card" : group.label[locale]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 space-y-0.5 text-center">
                              <span className="block text-xs font-semibold text-[var(--color-dark)]">{choice.label[locale]}</span>
                              <span className="block text-xs font-semibold text-[var(--color-primary)]">
                                {choice.priceDeltaCop === 0 ? checkoutUi.deliveryPriceFree : `+ ${formatPriceCop(choice.priceDeltaCop, locale)}`}
                              </span>
                            </div>
                          </button>
                        );
                      }),
                    )}
                  </div>
                </section>

                <div className="space-y-2 border-t border-[var(--color-primary-light)]/60 pt-4">
                  <textarea
                    id="gift-note"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={cardSelected ? ui.notePlaceholder : locale === "es" ? "Selecciona primero la tarjeta si quieres escribir un mensaje" : "Select the card first if you want to write a message"}
                    disabled={!cardSelected}
                    className="w-full resize-none border border-[var(--color-primary-light)]/75 bg-white px-4 py-3 text-sm outline-none transition-all disabled:cursor-not-allowed disabled:bg-[var(--color-primary-pale)]/50 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="border border-[var(--color-primary-light)]/70 bg-white/95 p-4 shadow-sm min-[900px]:col-span-2 2xl:col-span-1 2xl:col-start-3 2xl:sticky 2xl:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{ui.priceSummaryLabel}</p>
            <p className="mt-2 text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{formatPriceCop(priceSummary.totalCop, locale)}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{ui.basePriceLabel}: {formatPriceCop(priceSummary.basePriceCop, locale)}</p>

            <div className="mt-4 space-y-3 border-t border-[var(--color-primary-pale)] pt-3">
              <div className="border border-[var(--color-primary-light)]/70 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div />
                  {isDeliverySelectorOpen && (
                    <button
                      type="button"
                      onClick={() => setIsDeliverySelectorOpen(false)}
                      className="text-xs font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary)]/70"
                    >
                      {locale === "es" ? "Cerrar" : "Close"}
                    </button>
                  )}
                </div>

                {!isDeliverySelectorOpen ? (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setIsDeliverySelectorOpen(true)}
                      className="min-w-0 text-left"
                    >
                      <p className="text-[13px] font-semibold leading-snug text-[var(--color-primary)] underline underline-offset-2 transition hover:opacity-75">
                        {selectedDeliveryOption.method === "pickup"
                          ? (locale === "es" ? `Recoge ${selectedDeliveryOption.dateLabel}` : `Pickup ${selectedDeliveryOption.dateLabel}`)
                          : (locale === "es" ? `Entrega ${selectedDeliveryOption.dateLabel}` : `Delivery ${selectedDeliveryOption.dateLabel}`)}
                      </p>
                    </button>
                    <p className="mt-0.5 text-[13px] text-[var(--color-muted)] flex items-center gap-1.5">
                       <span className="inline-flex items-center bg-[var(--color-primary-pale)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                        {getDeliveryFeeBadgeText(selectedDeliveryOption.method)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[var(--color-primary-light)]"></span>
                      <span>{selectedDeliveryOption.label}</span>
                    </p>
                  </div>
                ) : (
                    <div className="mt-3 space-y-2">
                      {deliveryOptions.map((option) => {
                        const selected = option.method === deliveryMethod;

                        return (
                        <button
                          key={option.method}
                          type="button"
                          onClick={() => handleDeliveryMethodChange(option.method)}
                          className={`flex w-full items-start gap-3 border p-3 text-left transition ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]/40 shadow-sm" : "border-[var(--color-primary-light)]/70 bg-white hover:border-[var(--color-primary)]/60"}`}
                        >
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-primary-light)]"}`}>
                            {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="space-y-1">
                              <p className="text-[13px] font-bold leading-snug text-[var(--color-dark)] break-words">{option.label}</p>
                              <p className={`text-[11px] leading-snug ${selected ? "font-medium text-[var(--color-primary)]" : "text-[var(--color-muted)]"}`}>{locale === "es" ? "Entrega " : "Delivery "}{option.dateLabel}</p>
                              <span className="inline-flex w-fit max-w-full bg-[var(--color-primary-pale)] px-2.5 py-1 text-[10px] font-semibold leading-tight text-[var(--color-primary)] sm:text-[11px]">
                                {getDeliveryFeeBadgeText(option.method)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-3">
                {userHasActivePassport ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">✓</div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[var(--color-dark)]">{checkoutUi.passportApplied}</span>
                        <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">ACTIVE</span>
                      </div>
                      <span className="text-[10px] text-[var(--color-muted)] leading-tight">{checkoutUi.passportDescription}</span>
                    </div>
                  </div>
                ) : (
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
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[var(--color-dark)]">
                          {checkoutUi.passportCheckboxLabel}
                        </span>
                        <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          PROMO
                        </span>
                        <span className="text-xs font-bold text-[var(--color-primary)]">{checkoutUi.passportPromoPrice}</span>
                        <span className="text-[10px] text-[var(--color-muted)] line-through">{checkoutUi.passportRegularPrice}</span>
                      </div>
                      <span className="text-[10px] text-[var(--color-muted)] leading-tight">
                        {checkoutUi.passportDescription}
                      </span>
                    </div>
                  </label>
                )}
              </div>

              <div className="border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-4">
                <label htmlFor="autobuy-checkbox" className="flex items-start gap-3 cursor-pointer">
                  <div className="flex h-5 items-center">
                    <input
                      id="autobuy-checkbox"
                      type="checkbox"
                      checked={autoBuyConfig.enabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowAutoBuyModal(true);
                        } else {
                          setAutoBuyConfig({ ...autoBuyConfig, enabled: false });
                        }
                      }}
                      className="h-4 w-4 rounded border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--color-dark)]">
                      Auto-Buy {autoBuyConfig.enabled && `(${autoBuyConfig.frequency})`}
                    </span>
                    <span className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                      {autoBuyConfig.enabled 
                        ? `${autoBuyConfig.type === 'autoorder' ? 'Auto-purchase' : 'Reminder'} every ${autoBuyConfig.frequency}`
                        : 'Set up automatic recurring orders or reminders'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

              <AutoBuyModal
                isOpen={showAutoBuyModal}
                onClose={() => setShowAutoBuyModal(false)}
                onSave={(config) => {
                  setAutoBuyConfig(config);
                  setShowAutoBuyModal(false);
                }}
                ui={{
                  autoBuyModalTitle: "Configure Auto-Buy",
                  autoBuyModalDescription: "Set up automatic recurring orders or reminders for this product",
                  autoBuyFrequencyLabel: "Frequency",
                  autoBuyFrequencyWeekly: "Weekly",
                  autoBuyFrequencyBiweekly: "Biweekly",
                  autoBuyFrequencyMonthly: "Monthly",
                  autoBuyCancelButton: "Cancel",
                  autoBuyConfirmButton: "Save Configuration"
                }}
              />

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 inline-flex w-full items-center justify-center bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-95"
              >
                {addedFeedback ? ui.addedToCartLabel : ui.addToCartLabel}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="mt-3 inline-flex w-full items-center justify-center border border-[var(--color-primary-light)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
              >
                {ui.buyNowLabel}
              </button>

            <div className="mt-4 space-y-2 border-t border-[var(--color-primary-pale)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{ui.includesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => (
                  <span key={label} className="border border-[var(--color-primary-light)] bg-[var(--color-primary-pale)] px-3 py-1 text-xs text-[var(--color-primary)]">
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
