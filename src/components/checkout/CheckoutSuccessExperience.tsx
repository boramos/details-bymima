"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/components/cart/CartProvider";
import type { LandingDictionary, Locale } from "@/lib/i18n";
import type { OrderReceiptSnapshot } from "@/lib/receipt-types";

type CheckoutSuccessExperienceProps = {
  ui: LandingDictionary["checkoutSuccessUi"];
  locale: Locale;
};

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const DELIVERY_LABELS: Record<string, { en: string; es: string }> = {
  pickup: { en: "Store pickup", es: "Recogida en tienda" },
  standard: { en: "Standard delivery (3–5 days)", es: "Entrega estándar (3–5 días)" },
  tomorrow: { en: "Next-day delivery", es: "Entrega mañana" },
  today: { en: "Same-day delivery", es: "Entrega el mismo día" },
};

export default function CheckoutSuccessExperience({ ui, locale }: CheckoutSuccessExperienceProps) {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const emailSentRef = useRef(false);

  const fallbackOrderId = useRef(`DBM-${Date.now()}`);
  const hasClearedRef = useRef(false);
  const [receipt, setReceipt] = useState<OrderReceiptSnapshot | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [printReady, setPrintReady] = useState(false);

  useEffect(() => {
    if (!hasClearedRef.current) {
      hasClearedRef.current = true;
      clearCart();
    }
  }, [clearCart]);

  useEffect(() => {
    const raw = sessionStorage.getItem("order-receipt");
    if (raw) {
      const snapshot = JSON.parse(raw) as OrderReceiptSnapshot;
      sessionStorage.removeItem("order-receipt");
      setReceipt(snapshot);
    }

    const savedDeliveryMethod = localStorage.getItem("cart-delivery-method") ?? "standard";
    const now = new Date();

    switch (savedDeliveryMethod) {
      case "pickup": {
        setEstimatedDelivery(ui.estimatedDeliveryToday);
        break;
      }
      case "today": {
        const t = new Date(now);
        t.setHours(now.getHours() + 3);
        setEstimatedDelivery(
          `${ui.estimatedDeliveryToday.split(" - ")[0]} - ${t.toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", { hour: "2-digit", minute: "2-digit" })}`,
        );
        break;
      }
      case "tomorrow": {
        const t = new Date(now);
        t.setDate(t.getDate() + 1);
        setEstimatedDelivery(
          `${ui.estimatedDeliveryTomorrow} - ${t.toLocaleDateString(locale === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long" })}`,
        );
        break;
      }
      default: {
        const t = new Date(now);
        t.setDate(t.getDate() + 3);
        setEstimatedDelivery(
          t.toLocaleDateString(locale === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long" }),
        );
        break;
      }
    }

    localStorage.removeItem("cart-delivery-method");
    setPrintReady(true);
  }, [locale, ui]);

  useEffect(() => {
    if (!receipt || emailSentRef.current) return;
    emailSentRef.current = true;
    setEmailStatus("sending");

    fetch("/api/send-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receipt),
    })
      .then((res) => res.json())
      .then((data: { sent?: boolean }) => {
        setEmailStatus(data.sent ? "sent" : "failed");
      })
      .catch(() => setEmailStatus("failed"));
  }, [receipt]);

  const orderId = receipt?.orderId ?? searchParams.get("orderId") ?? fallbackOrderId.current;

  const formattedDate = new Date(receipt?.date ?? Date.now()).toLocaleDateString(
    locale === "es" ? "es-CO" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const deliveryMethodKey = receipt?.deliveryMethod ?? localStorage.getItem?.("cart-delivery-method") ?? "standard";
  const deliveryLabel =
    DELIVERY_LABELS[deliveryMethodKey]?.[locale === "es" ? "es" : "en"] ?? deliveryMethodKey;

  return (
    <>
      {printReady && (
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #receipt-print, #receipt-print * { visibility: visible !important; }
            #receipt-print {
              position: fixed !important;
              inset: 0 !important;
              padding: 32px !important;
              background: white !important;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      )}

      <section className="bg-[var(--color-cream)] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            id="receipt-print"
            className="rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-8 shadow-[0_20px_50px_rgba(28,25,23,0.1)] md:p-10"
          >
            <div className="border-b border-[var(--color-primary-pale)] pb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-dark)] md:text-4xl">
                {ui.title}
              </h1>
              <p className="mt-3 text-lg text-[var(--color-muted)]">{ui.subtitle}</p>

              {receipt?.customerEmail && (
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  {emailStatus === "sending" && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-rose-300 border-t-rose-500" />
                      {locale === "es" ? "Enviando recibo por email…" : "Sending receipt by email…"}
                    </span>
                  )}
                  {emailStatus === "sent" && (
                    <span className="text-green-600">
                      ✓ {locale === "es" ? `Recibo enviado a ${receipt.customerEmail}` : `Receipt sent to ${receipt.customerEmail}`}
                    </span>
                  )}
                  {emailStatus === "failed" && (
                    <span className="text-[var(--color-muted)]">
                      {locale === "es" ? "No se pudo enviar el email automáticamente." : "Could not send email automatically."}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="mt-8 space-y-5">
              <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)]/20 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                      {ui.orderNumberLabel}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--color-dark)]">
                      {orderId}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                      {ui.dateLabel}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-dark)]">{formattedDate}</p>
                  </div>
                </div>
              </div>

              {receipt && receipt.items.length > 0 && (
                <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                    {locale === "es" ? "Productos" : "Items"}
                  </p>
                  <div className="space-y-3">
                    {receipt.items.map((item) => (
                      <div key={`${item.name}-${item.quantity}`} className="flex items-start justify-between gap-3 border-b border-[var(--color-primary-pale)] pb-3 last:border-0 last:pb-0">
                        <div>
                          <span className="text-sm font-medium text-[var(--color-dark)]">
                            {item.name} × {item.quantity}
                          </span>
                          {item.selectedLabels.length > 0 && (
                            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                              {item.selectedLabels.join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                          {formatUsd(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-[var(--color-primary-pale)] pt-3 text-sm text-[var(--color-muted)]">
                    <div className="flex justify-between">
                      <span>{locale === "es" ? "Subtotal" : "Subtotal"}</span>
                      <span>{formatUsd(receipt.subtotal)}</span>
                    </div>
                    {receipt.taxes > 0 && (
                      <div className="flex justify-between">
                        <span>{locale === "es" ? "Impuestos" : "Taxes"}</span>
                        <span>{formatUsd(receipt.taxes)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{locale === "es" ? "Entrega" : "Delivery"}</span>
                      <span>{receipt.deliveryFee === 0 ? (locale === "es" ? "Gratis" : "Free") : formatUsd(receipt.deliveryFee)}</span>
                    </div>
                    {receipt.passportApplied && receipt.passportPrice > 0 && (
                      <div className="flex justify-between">
                        <span>Passport</span>
                        <span>{formatUsd(receipt.passportPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[var(--color-primary-pale)] pt-2 text-base font-bold text-[var(--color-dark)]">
                      <span>{locale === "es" ? "Total" : "Total"}</span>
                      <span className="text-[var(--color-primary)]">{formatUsd(receipt.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)]">
                      <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-dark)]">{deliveryLabel}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)]">
                      <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-dark)]">{ui.estimatedDeliveryLabel}</p>
                      <p className="mt-1 text-xs capitalize text-[var(--color-muted)]">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  {ui.nextStepsTitle}
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">1</span>
                    <p className="text-sm text-[var(--color-muted)]">{ui.nextStepEmailConfirmation}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">2</span>
                    <p className="text-sm text-[var(--color-muted)]">{ui.nextStepPreparation}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">3</span>
                    <p className="text-sm text-[var(--color-muted)]">{ui.nextStepDeliveryNotification}</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="no-print mt-8 flex flex-col items-center gap-3 border-t border-[var(--color-primary-pale)] pt-8 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary-light)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {locale === "es" ? "Imprimir / Guardar PDF" : "Print / Save PDF"}
              </button>
              <Link
                href="/order"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-95"
              >
                {ui.continueShoppingButton}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary-light)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
              >
                {ui.backToHomeButton}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
