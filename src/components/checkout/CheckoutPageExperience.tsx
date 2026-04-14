"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { AutoBuyConfig } from "./AutoBuyModal";

import { useCart } from "@/components/cart/CartProvider";
import { DeliveryMethodSelector } from "@/components/delivery/DeliveryMethodSelector";
import { formatCheckoutTotal, isSameDayEligible, type CheckoutDeliveryMethod, type CheckoutDraftItem, type CheckoutQuote } from "@/lib/checkout";
import type { LandingDictionary, Locale } from "@/lib/i18n";
import type { OrderReceiptSnapshot } from "@/lib/receipt-types";

type CardBrand = "visa" | "mastercard" | "amex" | "discover";

function detectCardBrand(digits: string): CardBrand | null {
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]\d{2}/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^6(?:011|22\d|4[4-9]|5)/.test(digits)) return "discover";
  return null;
}

function formatCardNumber(digits: string, brand: CardBrand | null): string {
  const clean = digits.replace(/\D/g, "");
  if (brand === "amex") {
    const p1 = clean.slice(0, 4);
    const p2 = clean.slice(4, 10);
    const p3 = clean.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }
  return clean.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function CardBrandBadge({ brand }: { brand: CardBrand }) {
  if (brand === "visa") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black italic tracking-tight bg-[#1a1f71] text-white select-none">
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span role="img" aria-label="Mastercard" className="inline-flex items-center select-none">
        <span className="inline-block h-5 w-5 rounded-full bg-[#eb001b] opacity-90" />
        <span className="inline-block h-5 w-5 -ml-3 rounded-full bg-[#f79e1b] opacity-90" />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black tracking-tight bg-[#007bc1] text-white select-none">
        AMEX
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black tracking-tight bg-[#f76f20] text-white select-none">
      DISC
    </span>
  );
}

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];

const ADDR_COUNTRIES: { value: string; label: string }[] = [
  { value: "United States", label: "United States" },
];

const ADDR_STATES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  "United States": [
    { value: "Florida", label: "Florida" },
  ],
};

type AddressFormData = {
  street: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  deliveryInstructions: string;
  isDefault: boolean;
};

function emptyAddrForm(): AddressFormData {
  return {
    street: "",
    apartment: "",
    city: "",
    state: ADDR_STATES_BY_COUNTRY["United States"]?.[0]?.value ?? "",
    postalCode: "",
    country: "United States",
    phone: "",
    deliveryInstructions: "",
    isDefault: false,
  };
}

function getExpiryYears(): string[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => String(current + i));
}

type CheckoutPageExperienceProps = {
  locale: Locale;
  ui: LandingDictionary["checkoutUi"];
  cartUi: LandingDictionary["cartUi"];
};

type PaymentMethod = "card" | "paypal";

type SavedCard = { id: string; last4: string; brand: string; expiryMonth: string; expiryYear: string; nickname: string | null; isDefault: boolean; cardCvc: string | null };

type SavedAddress = {
  id: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

type GiftCardDraft = {
  catalogId: string | null;
  amount: number;
  deliveryMethod: "EMAIL" | "TEXT" | "PHYSICAL";
  recipients: { id: string; name: string; email?: string; phone?: string; address?: string }[];
  message: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
};

export default function CheckoutPageExperience({ locale, ui, cartUi }: CheckoutPageExperienceProps) {
  const { items, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const [sandboxMode, setSandboxMode] = useState(() => process.env.NEXT_PUBLIC_SANDBOX_MODE === "true");
  const [buyNowItems, setBuyNowItems] = useState<CheckoutDraftItem[]>([]);
  const [giftCardDraft, setGiftCardDraft] = useState<GiftCardDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<CheckoutDeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPassport, setHasPassport] = useState(false);
  const [userHasActivePassport, setUserHasActivePassport] = useState(false);
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
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [showSaveCardPrompt, setShowSaveCardPrompt] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [useCardMode, setUseCardMode] = useState<"saved" | "new">("new");
  const [savedCardCvcInput, setSavedCardCvcInput] = useState("");
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [saveAsDefaultCard, setSaveAsDefaultCard] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useAddressMode, setUseAddressMode] = useState<"saved" | "new">("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState<AddressFormData>(emptyAddrForm());
  const [newAddrLoading, setNewAddrLoading] = useState(false);
  const [addrModalSnapshot, setAddrModalSnapshot] = useState<{ id: string | null; mode: "saved" | "new"; address: string; city: string; postalCode: string; newAddrForm: AddressFormData } | null>(null);
  const [newCardIsDefault, setNewCardIsDefault] = useState(false);
  const [newCardLoading, setNewCardLoading] = useState(false);
  const [cardSavedViaModal, setCardSavedViaModal] = useState(false);
  const [cardModalSnapshot, setCardModalSnapshot] = useState<{ id: string | null; mode: "saved" | "new"; cardNumber: string; cardName: string; cardCvc: string; expiryMonth: string; expiryYear: string; isDefault: boolean; savedCardCvc: string } | null>(null);

  const handleSaveCard = async () => {
    setSavingCard(true);
    try {
      const cleanNum = form.cardNumber.replace(/\D/g, "");
      const brand = detectCardBrand(cleanNum) || "unknown";
      const last4 = cleanNum.slice(-4);
      
      await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          last4,
          brand,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          nickname: null,
        }),
      });
    } catch {
    } finally {
      router.push("/checkout/success");
    }
  };

  const handleSkipSaveCard = () => {
    router.push("/checkout/success");
  };

  useEffect(() => {
    const rawGC = sessionStorage.getItem("gift-card-draft");
    if (rawGC) {
      const parsedGC = JSON.parse(rawGC) as GiftCardDraft;
      setGiftCardDraft(parsedGC);
      sessionStorage.removeItem("gift-card-draft");
      setForm((prev) => ({ ...prev, email: parsedGC.senderEmail, name: parsedGC.senderName }));
    }

    const raw = sessionStorage.getItem("buy-now-item");
    if (raw) {
      const parsed = JSON.parse(raw) as CheckoutDraftItem;
      setBuyNowItems([parsed]);
      sessionStorage.removeItem("buy-now-item");
    }

    const saved = localStorage.getItem("cart-delivery-method");
    if (saved) {
      const nextMethod = saved as CheckoutDeliveryMethod;
      setDeliveryMethod(nextMethod === "today" && !isSameDayEligible() ? "standard" : nextMethod);
    }
    
    const savedPassport = localStorage.getItem("cart-passport-selected");
    if (savedPassport === "true") {
      setHasPassport(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { config?: { sandbox_mode?: boolean | null } }) => {
        if (data.config?.sandbox_mode != null) {
          setSandboxMode(Boolean(data.config.sandbox_mode));
        }
      })
      .catch(() => {});
  }, []);

  const draftItems = useMemo<CheckoutDraftItem[]>(() => {
    if (buyNowItems.length > 0) {
      return buyNowItems;
    }
    return items.map((item) => ({
      productSlug: item.productSlug,
      quantity: item.quantity,
      selections: item.selections,
      note: item.note,
    }));
  }, [buyNowItems, items]);
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

  const handlePassportChange = (checked: boolean) => {
    setHasPassport(checked);
    localStorage.setItem("cart-passport-selected", checked.toString());
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setUserHasActivePassport(false);
      return;
    }

    fetch("/api/passport")
      .then((res) => res.json())
      .then((data) => {
        const active = Boolean(data.isActive);
        setUserHasActivePassport(active);

        if (active) {
          setHasPassport(false);
          localStorage.setItem("cart-passport-selected", "false");
        }
      })
      .catch(() => {
        setUserHasActivePassport(false);
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user/cards")
      .then((res) => res.json())
      .then((data: { success: boolean; data: SavedCard[] }) => {
        if (data.success && data.data.length > 0) {
          setSavedCards(data.data);
          const defaultCard = data.data.find((c) => c.isDefault) ?? data.data[0];
          setSelectedSavedCardId(defaultCard.id);
          setUseCardMode("saved");
          setSavedCardCvcInput(defaultCard.cardCvc ?? "");
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const { id: _id, email, name } = session.user;
    setForm((prev) => ({
      ...prev,
      email: prev.email || email || "",
      name: prev.name || name || "",
    }));
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data: { success: boolean; data: SavedAddress[] }) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSavedAddresses(data.data);
          const def = data.data.find((a) => a.isDefault) ?? data.data[0];
          setSelectedAddressId(def.id);
          setUseAddressMode("saved");
          setForm((prev) => ({
            ...prev,
            address: def.street + (def.apartment ? `, ${def.apartment}` : ""),
            city: def.city,
            postalCode: def.postalCode,
          }));
        }
      })
      .catch(() => {});
  }, [session?.user]);

  useEffect(() => {
    if (giftCardDraft !== null || draftItems.length === 0) {
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
  }, [deliveryMethod, draftItems, locale, hasPassport, giftCardDraft]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyAddress = (addr: SavedAddress) => {
    setForm((prev) => ({
      ...prev,
      address: addr.street + (addr.apartment ? `, ${addr.apartment}` : ""),
      city: addr.city,
      postalCode: addr.postalCode,
    }));
  };

  const openAddressModal = () => {
    setAddrModalSnapshot({ id: selectedAddressId, mode: useAddressMode, address: form.address, city: form.city, postalCode: form.postalCode, newAddrForm });
    setShowAddressModal(true);
  };

  const cancelAddressModal = () => {
    if (addrModalSnapshot) {
      setSelectedAddressId(addrModalSnapshot.id);
      setUseAddressMode(addrModalSnapshot.mode);
      setForm((p) => ({ ...p, address: addrModalSnapshot.address, city: addrModalSnapshot.city, postalCode: addrModalSnapshot.postalCode }));
      setNewAddrForm(addrModalSnapshot.newAddrForm);
    }
    setShowAddressModal(false);
  };

  const openCardModal = () => {
    setCardModalSnapshot({ id: selectedSavedCardId, mode: useCardMode, cardNumber: form.cardNumber, cardName: form.cardName, cardCvc: form.cardCvc, expiryMonth, expiryYear, isDefault: newCardIsDefault, savedCardCvc: savedCardCvcInput });
    setShowCardModal(true);
  };

  const cancelCardModal = () => {
    if (cardModalSnapshot) {
      setSelectedSavedCardId(cardModalSnapshot.id);
      setUseCardMode(cardModalSnapshot.mode);
      setForm((p) => ({ ...p, cardNumber: cardModalSnapshot.cardNumber, cardName: cardModalSnapshot.cardName, cardCvc: cardModalSnapshot.cardCvc }));
      setExpiryMonth(cardModalSnapshot.expiryMonth);
      setExpiryYear(cardModalSnapshot.expiryYear);
      setNewCardIsDefault(cardModalSnapshot.isDefault);
      setSavedCardCvcInput(cardModalSnapshot.savedCardCvc);
    }
    setShowCardModal(false);
  };

  const handleCheckout = async () => {
    if (!quote) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      setError(locale === "es" ? "Ingresa un correo electrónico válido" : "Enter a valid email address");
      return;
    }
    if (!form.name || form.name.trim().length < 2) {
      setError(locale === "es" ? "Ingresa tu nombre completo" : "Enter your full name");
      return;
    }
    if (deliveryMethod !== "pickup" && giftCardDraft === null) {
      if (!form.address || form.address.trim().length < 5) {
        setError(locale === "es" ? "Ingresa una dirección válida" : "Enter a valid address");
        return;
      }
      if (!form.city || form.city.trim().length < 2) {
        setError(locale === "es" ? "Ingresa la ciudad" : "Enter the city");
        return;
      }
      if (!form.postalCode || form.postalCode.replace(/\D/g, "").length < 4) {
        setError(locale === "es" ? "Ingresa un código postal válido" : "Enter a valid postal code");
        return;
      }
    }
    if (paymentMethod === "card" && useCardMode !== "saved") {
      const cleanCard = form.cardNumber.replace(/\D/g, "");
      const brand = detectCardBrand(cleanCard);
      const minLen = brand === "amex" ? 15 : 16;
      if (cleanCard.length < minLen) {
        setError(locale === "es" ? "Número de tarjeta inválido" : "Invalid card number");
        return;
      }
      if (!form.cardName || form.cardName.trim().length < 2) {
        setError(locale === "es" ? "Ingresa el nombre en la tarjeta" : "Enter the cardholder name");
        return;
      }
      if (!expiryMonth || !expiryYear) {
        setError(locale === "es" ? "Selecciona la fecha de vencimiento" : "Select expiration date");
        return;
      }
      const cvcLen = brand === "amex" ? 4 : 3;
      if (form.cardCvc.length < cvcLen) {
        setError(locale === "es" ? "CVV inválido" : "Invalid CVV");
        return;
      }
    }
    if (paymentMethod === "paypal") {
      if (!form.paypalEmail || !emailRegex.test(form.paypalEmail)) {
        setError(locale === "es" ? "Ingresa un correo PayPal válido" : "Enter a valid PayPal email");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // Persist the order to the database so it appears in "Your Orders"
      let orderNumber = `DBM-${Date.now()}`;
      if (session?.user) {
        try {
          const createOrderRes = await fetch("/api/checkout/create-order", {
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
              paymentMethod: paymentMethod === "card" ? "card" : "paypal",
              deliveryAddressId: useAddressMode === "saved" ? selectedAddressId : undefined,
            }),
          });
          const createOrderData = await createOrderRes.json() as { success?: boolean; data?: { orderNumber: string } };
          if (createOrderRes.ok && createOrderData.data?.orderNumber) {
            orderNumber = createOrderData.data.orderNumber;
          }
        } catch {
          // Order creation failed silently — don't block checkout
        }
      }

      const snapshot: OrderReceiptSnapshot = {
        orderId: orderNumber,
        customerEmail: form.email,
        customerName: form.name,
        date: new Date().toISOString(),
        items: quote.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          selectedLabels: item.selectedLabels,
        })),
        subtotal: quote.subtotal,
        taxes: quote.taxes,
        deliveryFee: quote.deliveryFee,
        passportPrice: quote.passportPrice,
        passportApplied: quote.passportApplied,
        total: quote.total,
        deliveryMethod: quote.deliveryMethod,
        locale,
      };

      if (sandboxMode) {
        sessionStorage.setItem("order-receipt", JSON.stringify(snapshot));
        if (session?.user && useAddressMode === "new" && saveNewAddress) {
          await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              street: form.address,
              city: form.city,
              postalCode: form.postalCode,
              country: "United States",
              isDefault: saveAsDefault,
            }),
          }).catch(() => {});
        }
        if (session?.user && paymentMethod === "card" && useCardMode === "new" && !cardSavedViaModal) {
          if (savedCards.length === 0 && saveNewCard) {
            const cleanNum = form.cardNumber.replace(/\D/g, "");
            const detectedBrand = detectCardBrand(cleanNum) ?? "visa";
            await fetch("/api/user/cards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                last4: cleanNum.slice(-4),
                brand: detectedBrand,
                expiryMonth,
                expiryYear,
                cardCvc: form.cardCvc || null,
                nickname: null,
                isDefault: saveAsDefaultCard,
              }),
            }).catch(() => {});
          } else if (savedCards.length > 0 || !saveNewCard) {
            setShowSaveCardPrompt(true);
            return;
          }
        }
        router.push("/checkout/success");
        return;
      }

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

      if (session?.user && useAddressMode === "new" && saveNewAddress) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: form.address,
            city: form.city,
            postalCode: form.postalCode,
            country: "United States",
            isDefault: saveAsDefault,
          }),
        }).catch(() => {});
      }

      sessionStorage.setItem("order-receipt", JSON.stringify(snapshot));

      window.location.href = data.url;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to continue to payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGiftCardCheckout = async () => {
    if (!giftCardDraft) return;
    setSubmitting(true);
    setError(null);
    try {
      if (sandboxMode) {
        const sandboxSnapshot: OrderReceiptSnapshot = {
          orderId: `DBM-GC-${Date.now()}`,
          customerEmail: giftCardDraft.senderEmail,
          customerName: giftCardDraft.senderName,
          date: new Date().toISOString(),
          items: giftCardDraft.recipients.map((r) => ({
            name: locale === "es" ? "Tarjeta de regalo" : "Gift Card",
            quantity: 1,
            unitPrice: giftCardDraft.amount,
            lineTotal: giftCardDraft.amount,
            selectedLabels: r.name ? [r.name] : [],
          })),
          subtotal: giftCardDraft.amount * giftCardDraft.recipients.length,
          taxes: 0,
          deliveryFee: 0,
          passportPrice: 0,
          passportApplied: false,
          total: giftCardDraft.amount * giftCardDraft.recipients.length,
          deliveryMethod: "pickup",
          locale,
        };
        sessionStorage.setItem("order-receipt", JSON.stringify(sandboxSnapshot));
        router.push("/checkout/success");
        return;
      }

      const res = await fetch("/api/checkout/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftCardDraft),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Unable to continue to payment");
      window.location.href = data.url;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to continue to payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && buyNowItems.length === 0 && giftCardDraft === null) {
    if (!hydrated) return null;
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
        {showSaveCardPrompt && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--color-primary-light)] bg-white p-5 shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-[var(--color-primary)] shrink-0">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[var(--color-dark)]">
                  {locale === "es" ? "¿Guardar esta tarjeta para próximas compras?" : "Save this card for future purchases?"}
                </p>
                <p className="text-sm text-[var(--color-muted)] flex items-center gap-2 mt-0.5">
                  {detectCardBrand(form.cardNumber) && <CardBrandBadge brand={detectCardBrand(form.cardNumber)!} />}
                  <span className="font-mono">•••• {form.cardNumber.replace(/\D/g, "").slice(-4)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={handleSkipSaveCard} 
                disabled={savingCard}
                className="px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-dark)] disabled:opacity-50"
              >
                {locale === "es" ? "No, gracias" : "No, thanks"}
              </button>
              <button 
                type="button" 
                onClick={handleSaveCard}
                disabled={savingCard}
                className="rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {savingCard ? (locale === "es" ? "Guardando..." : "Saving...") : (locale === "es" ? "Guardar" : "Save")}
              </button>
            </div>
          </div>
        )}
        {sandboxMode && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <span className="text-xl" aria-hidden="true">🧪</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {locale === "es" ? "Modo de prueba activo" : "Test mode active"}
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                {locale === "es"
                  ? "No se procesarán pagos reales. El flujo completo simulará una compra exitosa."
                  : "No real payments will be processed. The full flow will simulate a successful purchase."}
              </p>
            </div>
          </div>
        )}
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
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder={ui.emailLabel} required className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder={ui.nameLabel} required minLength={2} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
              </div>
            </section>

            {deliveryMethod !== "pickup" && giftCardDraft === null && (
              <section className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--color-dark)]">
                    {locale === "es" ? "Dirección de entrega" : "Delivery address"}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button type="button" onClick={openAddressModal} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                      {locale === "es" ? "Cambiar" : "Change"}
                    </button>
                  )}
                </div>
                {savedAddresses.length > 0 && useAddressMode === "saved" ? (
                  (() => {
                    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
                    if (!addr) return null;
                    return (
                      <div className="mt-4 rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3">
                        <p className="text-sm font-medium text-[var(--color-dark)]">
                          {addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                        </p>
                        {addr.isDefault && (
                          <span className="mt-1 inline-block text-[10px] font-semibold text-[var(--color-primary)]">
                            {locale === "es" ? "Predeterminada" : "Default"}
                          </span>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <input type="text" value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder={ui.addressLabel} required minLength={5} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder={ui.cityLabel} required minLength={2} className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    <input type="text" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value.replace(/[^\d\s-]/g, "").slice(0, 10))} placeholder={ui.postalCodeLabel} required className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                    {session?.user ? (
                      <div className="col-span-2 flex flex-col gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                          <span className="text-sm text-[var(--color-dark)]">
                            {locale === "es" ? "Guardar en mi perfil" : "Save to my profile"}
                          </span>
                        </label>
                        {saveNewAddress && (
                          <label className="flex items-center gap-2 cursor-pointer ml-6">
                            <input type="checkbox" checked={saveAsDefault} onChange={(e) => setSaveAsDefault(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                            <span className="text-sm text-[var(--color-dark)]">
                              {locale === "es" ? "Establecer como predeterminada" : "Set as default"}
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="col-span-2 flex items-start gap-3 rounded-xl border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)]/40 px-4 py-3">
                        <svg className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm text-[var(--color-dark)]">
                          {locale === "es" ? (
                            <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Crea una cuenta</a> para guardar esta información para próximas compras.</span>
                          ) : (
                            <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Create an account</a> to save this info for future orders.</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}



            <section className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--color-dark)]">{ui.paymentTitle}</h2>
                {paymentMethod === "card" && savedCards.length > 0 && (
                  <button type="button" onClick={openCardModal} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                    {locale === "es" ? "Cambiar" : "Change"}
                  </button>
                )}
              </div>
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
                    {savedCards.length > 0 && useCardMode === "saved" ? (
                      (() => {
                        const card = savedCards.find((c) => c.id === selectedSavedCardId);
                        if (!card) return null;
                        const brand = card.brand as CardBrand;
                        return (
                          <>
                            <div className="col-span-2 flex items-center gap-3 rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3">
                              {(brand === "visa" || brand === "mastercard" || brand === "amex" || brand === "discover") && (
                                <CardBrandBadge brand={brand} />
                              )}
                              <span className="font-mono text-sm text-[var(--color-dark)]">•••• {card.last4}</span>
                              <span className="text-xs text-[var(--color-muted)]">{card.expiryMonth}/{card.expiryYear.slice(-2)}</span>
                              {card.nickname && <span className="text-xs text-[var(--color-muted)]">{card.nickname}</span>}
                              {card.isDefault && (
                                <span className="ml-auto rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                  {locale === "es" ? "Predeterminada" : "Default"}
                                </span>
                              )}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <input value={form.cardName} onChange={(e) => setField("cardName", e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'.-]/g, ""))} placeholder={ui.cardNameLabel} required minLength={2} autoComplete="cc-name" className="col-span-2 rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                        <div className="relative col-span-2">
                          <input
                            value={formatCardNumber(form.cardNumber, detectCardBrand(form.cardNumber))}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              const brand = detectCardBrand(raw);
                              const max = brand === "amex" ? 15 : 16;
                              setField("cardNumber", raw.slice(0, max));
                            }}
                            placeholder={ui.cardNumberLabel}
                            inputMode="numeric"
                            autoComplete="cc-number"
                            className="w-full rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3 pr-16"
                          />
                          {detectCardBrand(form.cardNumber) && (
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <CardBrandBadge brand={detectCardBrand(form.cardNumber)!} />
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-2">
                          <div>
                            <select
                              value={expiryMonth}
                              onChange={(e) => {
                                setExpiryMonth(e.target.value);
                                setField("cardExpiry", `${e.target.value}/${expiryYear.slice(-2)}`);
                              }}
                              aria-label={locale === "es" ? "Mes de vencimiento" : "Expiry month"}
                              className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white px-3 py-3 text-sm text-[var(--color-dark)]"
                            >
                              <option value="">{locale === "es" ? "Mes" : "Month"}</option>
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <select
                              value={expiryYear}
                              onChange={(e) => {
                                setExpiryYear(e.target.value);
                                setField("cardExpiry", `${expiryMonth}/${e.target.value.slice(-2)}`);
                              }}
                              aria-label={locale === "es" ? "Año de vencimiento" : "Expiry year"}
                              className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white px-3 py-3 text-sm text-[var(--color-dark)]"
                            >
                              <option value="">{locale === "es" ? "Año" : "Year"}</option>
                              {getExpiryYears().map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input value={form.cardCvc} onChange={(e) => setField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, detectCardBrand(form.cardNumber) === "amex" ? 4 : 3))} placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" className="w-full rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                          </div>
                        </div>
                        {savedCards.length === 0 && (
                          session?.user ? (
                            <div className="col-span-2 flex flex-col gap-2 pt-1">
                              <label className="flex cursor-pointer items-center gap-2">
                                <input type="checkbox" checked={saveNewCard} onChange={(e) => setSaveNewCard(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                                <span className="text-sm text-[var(--color-dark)]">
                                  {locale === "es" ? "Guardar en mi perfil" : "Save to my profile"}
                                </span>
                              </label>
                              {saveNewCard && (
                                <label className="ml-6 flex cursor-pointer items-center gap-2">
                                  <input type="checkbox" checked={saveAsDefaultCard} onChange={(e) => setSaveAsDefaultCard(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                                  <span className="text-sm text-[var(--color-dark)]">
                                    {locale === "es" ? "Establecer como predeterminada" : "Set as default"}
                                  </span>
                                </label>
                              )}
                            </div>
                          ) : (
                            <div className="col-span-2 flex items-start gap-3 rounded-xl border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)]/40 px-4 py-3">
                              <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <p className="text-sm text-[var(--color-dark)]">
                                {locale === "es" ? (
                                  <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Crea una cuenta</a> para guardar esta tarjeta para próximas compras.</span>
                                ) : (
                                  <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Create an account</a> to save this card for future orders.</span>
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <input type="email" value={form.paypalEmail} onChange={(e) => setField("paypalEmail", e.target.value)} placeholder={ui.paypalEmailLabel} required className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3" />
                )}
              </div>
            </section>

            {showAddressModal && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
                onClick={(e) => { if (e.target === e.currentTarget) cancelAddressModal(); }}
                onKeyDown={(e) => { if (e.key === "Escape") cancelAddressModal(); }}
              >
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-4">
                    {locale === "es" ? "Seleccionar dirección" : "Select address"}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id && useAddressMode === "saved";
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setUseAddressMode("saved");
                          }}
                          className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white hover:bg-[var(--color-primary-pale)]/40"}`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center shrink-0 mt-0.5">
                            <div className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-muted)]"}`}>
                              {isSelected && <div className="h-full w-full rounded-full bg-white scale-[0.4]" />}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--color-dark)]">
                              {addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}
                            </p>
                            <p className="text-xs text-[var(--color-muted)] mt-0.5">
                              {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                            </p>
                            {addr.isDefault && (
                              <span className="mt-1 inline-block text-[10px] font-semibold text-[var(--color-primary)]">
                                {locale === "es" ? "Predeterminada" : "Default"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setUseAddressMode("new");
                        setSelectedAddressId(null);
                        setForm((p) => ({ ...p, address: "", city: "", postalCode: "" }));
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${useAddressMode === "new" ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white hover:bg-[var(--color-primary-pale)]/40"}`}
                    >
                      <div className="flex h-5 w-5 items-center justify-center shrink-0">
                        <div className={`h-4 w-4 rounded-full border-2 ${useAddressMode === "new" ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-muted)]"}`}>
                          {useAddressMode === "new" && <div className="h-full w-full rounded-full bg-white scale-[0.4]" />}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-dark)]">
                        {locale === "es" ? "+ Usar nueva dirección" : "+ Use a new address"}
                      </span>
                    </button>
                  </div>
                  {useAddressMode === "new" && (() => {
                    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
                    const selectClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
                    const labelClass = "block text-sm font-medium text-[var(--color-dark)] mb-1.5";
                    const addrStates = ADDR_STATES_BY_COUNTRY[newAddrForm.country] ?? [];

                    const handleNewAddrCountry = (country: string) => {
                      const states = ADDR_STATES_BY_COUNTRY[country] ?? [];
                      setNewAddrForm((p) => ({ ...p, country, state: states[0]?.value ?? "" }));
                    };

                    const handleNewAddrSubmit = async (e: React.FormEvent) => {
                      e.preventDefault();
                      setNewAddrLoading(true);
                      try {
                        let newId: string | null = null;
                        if (session?.user) {
                          const res = await fetch("/api/addresses", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newAddrForm),
                          });
                          if (res.ok) {
                            const body = await res.json() as { success: boolean; data?: SavedAddress; address?: SavedAddress };
                            const created = (body as { success: boolean; data?: SavedAddress }).data ?? (body as { address?: SavedAddress }).address ?? null;
                            if (created) {
                              newId = created.id;
                              setSavedAddresses((prev) => [...prev, created]);
                            }
                          }
                        }
                        setForm((p) => ({
                          ...p,
                          address: newAddrForm.street + (newAddrForm.apartment ? `, ${newAddrForm.apartment}` : ""),
                          city: newAddrForm.city,
                          postalCode: newAddrForm.postalCode,
                        }));
                        if (newId) {
                          setSelectedAddressId(newId);
                          setUseAddressMode("saved");
                        }
                        setNewAddrForm(emptyAddrForm());
                        setShowAddressModal(false);
                      } catch {
                      } finally {
                        setNewAddrLoading(false);
                      }
                    };

                    return (
                      <form id="new-addr-form" onSubmit={(e) => { void handleNewAddrSubmit(e); }} className="space-y-4 mb-4">
                        <div>
                          <label htmlFor="co-af-street" className={labelClass}>{locale === "es" ? "Dirección" : "Street address"}</label>
                          <input id="co-af-street" type="text" value={newAddrForm.street} onChange={(e) => setNewAddrForm((p) => ({ ...p, street: e.target.value }))} placeholder={locale === "es" ? "Dirección" : "Street address"} className={inputClass} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="co-af-apt" className={labelClass}>Apt/Suite</label>
                            <input id="co-af-apt" type="text" value={newAddrForm.apartment} onChange={(e) => setNewAddrForm((p) => ({ ...p, apartment: e.target.value }))} placeholder={locale === "es" ? "Apt/Suite" : "Apt/Suite"} className={inputClass} />
                          </div>
                          <div>
                            <label htmlFor="co-af-city" className={labelClass}>{locale === "es" ? "Ciudad" : "City"}</label>
                            <input id="co-af-city" type="text" value={newAddrForm.city} onChange={(e) => setNewAddrForm((p) => ({ ...p, city: e.target.value }))} placeholder={locale === "es" ? "Ciudad" : "City"} className={inputClass} required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="co-af-country" className={labelClass}>{locale === "es" ? "País" : "Country"}</label>
                            <div className="relative">
                              <select id="co-af-country" value={newAddrForm.country} onChange={(e) => handleNewAddrCountry(e.target.value)} className={selectClass}>
                                {ADDR_COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label htmlFor="co-af-state" className={labelClass}>{locale === "es" ? "Estado" : "State"}</label>
                            <div className="relative">
                              <select id="co-af-state" value={newAddrForm.state} onChange={(e) => setNewAddrForm((p) => ({ ...p, state: e.target.value }))} className={selectClass} disabled={addrStates.length === 0}>
                                {addrStates.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="co-af-zip" className={labelClass}>{locale === "es" ? "Código Postal" : "ZIP Code"}</label>
                            <input id="co-af-zip" type="text" value={newAddrForm.postalCode} onChange={(e) => setNewAddrForm((p) => ({ ...p, postalCode: e.target.value.replace(/[^\d\s-]/g, "").slice(0, 10) }))} placeholder={locale === "es" ? "Código Postal" : "ZIP Code"} className={inputClass} required />
                          </div>
                          <div>
                            <label htmlFor="co-af-phone" className={labelClass}>{locale === "es" ? "Teléfono" : "Phone"}</label>
                            <input id="co-af-phone" type="tel" value={newAddrForm.phone} onChange={(e) => setNewAddrForm((p) => ({ ...p, phone: e.target.value.replace(/[^\d\s+\-()]/g, "") }))} placeholder={locale === "es" ? "Teléfono" : "Phone"} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="co-af-instr" className={labelClass}>{locale === "es" ? "Instrucciones de entrega" : "Delivery instructions"}</label>
                          <textarea id="co-af-instr" rows={2} value={newAddrForm.deliveryInstructions} onChange={(e) => setNewAddrForm((p) => ({ ...p, deliveryInstructions: e.target.value }))} placeholder={locale === "es" ? "Instrucciones de entrega" : "Delivery instructions"} className={inputClass} />
                        </div>
                        {session?.user && (
                          <div className="flex items-center gap-2">
                            <input id="co-af-default" type="checkbox" checked={newAddrForm.isDefault} onChange={(e) => setNewAddrForm((p) => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 accent-[var(--color-primary)]" />
                            <label htmlFor="co-af-default" className="text-sm font-medium text-[var(--color-dark)]">
                              {locale === "es" ? "Dirección predeterminada" : "Set as default"}
                            </label>
                          </div>
                        )}
                        {!session?.user && (
                          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)]/40 px-4 py-3">
                            <svg className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-sm text-[var(--color-dark)]">
                              {locale === "es" ? (
                                <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Crea una cuenta</a> para guardar esta dirección.</span>
                              ) : (
                                <span><a href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Create an account</a> to save this address.</span>
                              )}
                            </p>
                          </div>
                        )}
                      </form>
                    );
                  })()}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelAddressModal}
                      className="flex-1 rounded-full border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--color-dark)] hover:bg-[var(--color-primary-pale)]/40 transition-colors"
                    >
                      {locale === "es" ? "Cancelar" : "Cancel"}
                    </button>
                    <button
                      type={useAddressMode === "new" ? "submit" : "button"}
                      form={useAddressMode === "new" ? "new-addr-form" : undefined}
                      disabled={useAddressMode === "new" ? newAddrLoading : false}
                      onClick={useAddressMode === "saved" ? () => {
                        if (selectedAddressId) {
                          const addr = savedAddresses.find((a) => a.id === selectedAddressId);
                          if (addr) applyAddress(addr);
                        }
                        setShowAddressModal(false);
                      } : undefined}
                      className="flex-1 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {newAddrLoading ? "..." : (locale === "es" ? "Confirmar" : "Confirm")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCardModal && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
                onClick={(e) => { if (e.target === e.currentTarget) cancelCardModal(); }}
                onKeyDown={(e) => { if (e.key === "Escape") cancelCardModal(); }}
              >
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-4">
                    {locale === "es" ? "Seleccionar tarjeta" : "Select card"}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {savedCards.map((card) => {
                      const brand = card.brand as CardBrand;
                      const isSelected = selectedSavedCardId === card.id && useCardMode === "saved";
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedSavedCardId(card.id);
                            setUseCardMode("saved");
                            setSavedCardCvcInput(card.cardCvc ?? "");
                          }}
                          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white hover:bg-[var(--color-primary-pale)]/40"}`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center shrink-0">
                            <div className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-muted)]"}`}>
                              {isSelected && <div className="h-full w-full rounded-full bg-white scale-[0.4]" />}
                            </div>
                          </div>
                          {(brand === "visa" || brand === "mastercard" || brand === "amex" || brand === "discover") && (
                            <CardBrandBadge brand={brand} />
                          )}
                          <span className="font-mono text-sm text-[var(--color-dark)]">•••• {card.last4}</span>
                          <span className="text-xs text-[var(--color-muted)]">{card.expiryMonth}/{card.expiryYear.slice(-2)}</span>
                          {card.nickname && <span className="text-xs text-[var(--color-muted)]">{card.nickname}</span>}
                          {card.isDefault && (
                            <span className="ml-auto rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              {locale === "es" ? "Predeterminada" : "Default"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setUseCardMode("new");
                        setSelectedSavedCardId(null);
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${useCardMode === "new" ? "border-[var(--color-primary)] bg-[var(--color-primary-pale)]" : "border-[var(--color-primary-light)]/70 bg-white hover:bg-[var(--color-primary-pale)]/40"}`}
                    >
                      <div className="flex h-5 w-5 items-center justify-center shrink-0">
                        <div className={`h-4 w-4 rounded-full border-2 ${useCardMode === "new" ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-muted)]"}`}>
                          {useCardMode === "new" && <div className="h-full w-full rounded-full bg-white scale-[0.4]" />}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-dark)]">
                        {locale === "es" ? "+ Usar nueva tarjeta" : "+ Use a new card"}
                      </span>
                    </button>
                  </div>
                  {useCardMode === "new" && (() => {
                    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
                    const selectCls = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
                    const labelCls = "block text-sm font-medium text-[var(--color-dark)] mb-1.5";

                    const handleNewCardSubmit = async (e: React.FormEvent) => {
                      e.preventDefault();
                      const cleanNum = form.cardNumber.replace(/\D/g, "");
                      const detectedBrand = detectCardBrand(cleanNum);
                      const minLen = detectedBrand === "amex" ? 15 : 16;
                      if (cleanNum.length < minLen || !detectedBrand) return;
                      if (!expiryMonth || !expiryYear) return;
                      setNewCardLoading(true);
                      try {
                        if (session?.user && detectedBrand) {
                          const apiRes = await fetch("/api/user/cards", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              last4: cleanNum.slice(-4),
                              brand: detectedBrand,
                              expiryMonth,
                              expiryYear,
                              cardCvc: form.cardCvc || null,
                              nickname: null,
                              isDefault: newCardIsDefault,
                            }),
                          });
                          if (apiRes.ok) {
                            const body = await apiRes.json() as { success: boolean; data?: SavedCard };
                            if (body.success && body.data) {
                              setSavedCards((prev) => [...prev, body.data!]);
                              setSelectedSavedCardId(body.data.id);
                              setUseCardMode("saved");
                              setSavedCardCvcInput(form.cardCvc);
                              setCardSavedViaModal(true);
                            }
                          }
                        }
                        setShowCardModal(false);
                      } catch {
                      } finally {
                        setNewCardLoading(false);
                      }
                    };

                    return (
                      <form id="new-card-form" onSubmit={(e) => { void handleNewCardSubmit(e); }} className="space-y-4 mb-4">
                        <div>
                          <input
                            id="co-cf-name"
                            value={form.cardName}
                            onChange={(e) => setField("cardName", e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'.-]/g, ""))}
                            placeholder={ui.cardNameLabel}
                            autoComplete="cc-name"
                            className={inputCls}
                            required
                            minLength={2}
                          />
                        </div>
                        <div>
                          <div className="relative">
                            <input
                              id="co-cf-number"
                              value={formatCardNumber(form.cardNumber, detectCardBrand(form.cardNumber))}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const brand = detectCardBrand(raw);
                                const max = brand === "amex" ? 15 : 16;
                                setField("cardNumber", raw.slice(0, max));
                              }}
                              placeholder={ui.cardNumberLabel}
                              inputMode="numeric"
                              autoComplete="cc-number"
                              className={inputCls + " pr-16"}
                              required
                            />
                            {detectCardBrand(form.cardNumber) && (
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                <CardBrandBadge brand={detectCardBrand(form.cardNumber)!} />
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="relative">
                              <select
                                id="co-cf-month"
                                value={expiryMonth}
                                onChange={(e) => {
                                  setExpiryMonth(e.target.value);
                                  setField("cardExpiry", `${e.target.value}/${expiryYear.slice(-2)}`);
                                }}
                                className={selectCls}
                                required
                              >
                                <option value="">{locale === "es" ? "Mes" : "Month"}</option>
                                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <select
                                id="co-cf-year"
                                value={expiryYear}
                                onChange={(e) => {
                                  setExpiryYear(e.target.value);
                                  setField("cardExpiry", `${expiryMonth}/${e.target.value.slice(-2)}`);
                                }}
                                className={selectCls}
                                required
                              >
                                <option value="">{locale === "es" ? "Año" : "Year"}</option>
                                {getExpiryYears().map((y) => <option key={y} value={y}>{y}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <input
                              id="co-cf-cvc"
                              value={form.cardCvc}
                              onChange={(e) => setField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, detectCardBrand(form.cardNumber) === "amex" ? 4 : 3))}
                              placeholder="CVV"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              className={inputCls}
                              required
                            />
                          </div>
                        </div>
                        {session?.user && (
                          <div className="flex items-center gap-2">
                            <input
                              id="co-cf-default"
                              type="checkbox"
                              checked={newCardIsDefault}
                              onChange={(e) => setNewCardIsDefault(e.target.checked)}
                              className="w-4 h-4 accent-[var(--color-primary)]"
                            />
                            <label htmlFor="co-cf-default" className="text-sm font-medium text-[var(--color-dark)]">
                              {locale === "es" ? "Tarjeta predeterminada" : "Set as default"}
                            </label>
                          </div>
                        )}
                      </form>
                    );
                  })()}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelCardModal}
                      className="flex-1 rounded-full border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm font-semibold text-[var(--color-dark)] hover:bg-[var(--color-primary-pale)]/40 transition-colors"
                    >
                      {locale === "es" ? "Cancelar" : "Cancel"}
                    </button>
                    <button
                      type={useCardMode === "new" ? "submit" : "button"}
                      form={useCardMode === "new" ? "new-card-form" : undefined}
                      disabled={useCardMode === "new" ? newCardLoading : false}
                      onClick={useCardMode === "saved" ? () => setShowCardModal(false) : undefined}
                      className="flex-1 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {newCardLoading ? "..." : (locale === "es" ? "Confirmar" : "Confirm")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)] lg:sticky lg:top-28">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{ui.summaryTitle}</h2>
            {!giftCardDraft && loadingQuote ? <p className="mt-4 text-sm text-[var(--color-muted)]">{ui.loadingQuoteLabel}</p> : null}
            {giftCardDraft !== null ? (
              <div className="mt-5 space-y-4">
                <div className="border-b border-[var(--color-primary-pale)] pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[var(--color-dark)]">
                        {locale === "es" ? "Tarjeta de regalo" : "Gift Card"}
                        {giftCardDraft.recipients.length > 1 ? ` × ${giftCardDraft.recipients.length}` : ""}
                      </span>
                      <p className="text-xs text-[var(--color-muted)]">
                        ${giftCardDraft.amount}{locale === "es" ? " por tarjeta" : " per card"}
                        {" · "}
                        {giftCardDraft.deliveryMethod === "EMAIL"
                          ? "Email"
                          : giftCardDraft.deliveryMethod === "TEXT"
                          ? "SMS"
                          : locale === "es" ? "Entrega física" : "Physical delivery"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      ${giftCardDraft.amount * giftCardDraft.recipients.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-primary-pale)] pt-3 text-base font-semibold text-[var(--color-dark)]">
                  <span>{ui.totalLabel}</span>
                  <span>${giftCardDraft.amount * giftCardDraft.recipients.length}</span>
                </div>
              </div>
            ) : quote ? (
              <div className="mt-5 space-y-4">
                {quote.items.map((item) => (
                  <div key={`${item.productSlug}-${item.note}`} className="space-y-1 border-b border-[var(--color-primary-pale)] pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-medium text-[var(--color-dark)]">{item.productName} × {item.quantity}</span>
                        <div className="flex items-center gap-2">
                          {buyNowItems.length === 0 && (() => {
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
                              if (buyNowItems.length > 0) {
                                setBuyNowItems([]);
                              } else {
                                const cartItem = items.find((entry) => entry.productSlug === item.productSlug && entry.note === item.note);
                                if (cartItem) removeItem(cartItem.id);
                              }
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

                <div className="mb-4">
                  <div className="rounded-xl border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-4">
                    {userHasActivePassport ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                          ✓
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[var(--color-dark)]">{ui.passportApplied}</span>
                            <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">ACTIVE</span>
                          </div>
                          <span className="text-[10px] text-[var(--color-muted)] leading-tight">{ui.passportDescription}</span>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="passport-checkbox" className="flex items-start gap-3 cursor-pointer">
                        <div className="flex h-5 items-center">
                          <input
                            id="passport-checkbox"
                            type="checkbox"
                            checked={hasPassport}
                            onChange={(e) => handlePassportChange(e.target.checked)}
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
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <DeliveryMethodSelector
                    deliveryMethod={deliveryMethod}
                    onDeliveryMethodChange={(method) => {
                      setDeliveryMethod(method);
                      localStorage.setItem("cart-delivery-method", method);
                    }}
                    hasPassport={hasPassport || userHasActivePassport}
                    isAuthenticated={!!session?.user}
                    sameDayAvailable={sameDayAvailable}
                    ui={{
                      deliveryMethodLabel: ui.deliveryMethodLabel,
                      deliveryMethodPickup: ui.deliveryMethodPickup,
                      deliveryMethodStandard: ui.deliveryMethodStandard,
                      deliveryMethodTomorrow: ui.deliveryMethodTomorrow,
                      deliveryMethodToday: ui.deliveryMethodToday,
                      deliveryPriceFree: ui.deliveryPriceFree,
                      deliveryPriceMemberDiscount: ui.deliveryPriceMemberDiscount,
                    }}
                  />
                </div>

                <div className="space-y-2 border-t border-[var(--color-primary-pale)] pt-3 text-sm text-[var(--color-muted)]">
                  <div className="flex items-center justify-between"><span>{cartUi.subtotalLabel}</span><span>{formatCheckoutTotal(quote.subtotal, locale)}</span></div>
                  <div className="flex items-center justify-between"><span>{ui.taxesLabel}</span><span>{formatCheckoutTotal(quote.taxes, locale)}</span></div>
                  {quote.passportApplied || quote.hasActivePassport ? (
                    <div className="flex items-center justify-between">
                      <span>{quote.hasActivePassport ? ui.passportApplied : ui.passportTitle}</span>
                      <div className="flex items-center gap-2">
                        {quote.passportApplied ? <span className="line-through opacity-50">{ui.passportRegularPrice}</span> : null}
                        <span className="font-semibold text-[var(--color-primary)]">{quote.hasActivePassport ? ui.deliveryPriceFree : formatCheckoutTotal(quote.passportPrice, locale)}</span>
                      </div>
                    </div>
                  ) : null}
                  {quote.deliveryMethod !== "pickup" ? (
                    <div className="flex items-center justify-between"><span>{ui.deliveryTitle}</span><span>{quote.deliveryFee === 0 ? ui.deliveryPriceFree : formatCheckoutTotal(quote.deliveryFee, locale)}</span></div>
                  ) : null}
                  <div className="flex items-center justify-between text-base font-semibold text-[var(--color-dark)]">
                    <span>{ui.totalLabel}</span>
                    <span>{formatCheckoutTotal(quote.total, locale)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={() => void (giftCardDraft !== null ? handleGiftCardCheckout() : handleCheckout())}
              disabled={giftCardDraft !== null ? submitting : (!quote || submitting || loadingQuote)}
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
