"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/components/cart/CartProvider";
import type { LandingDictionary, Locale } from "@/lib/i18n";

type CheckoutSuccessExperienceProps = {
  ui: LandingDictionary["checkoutSuccessUi"];
  locale: Locale;
};

export default function CheckoutSuccessExperience({ ui, locale }: CheckoutSuccessExperienceProps) {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    deliveryMethod: string;
    estimatedDelivery: string;
    deliveryAddress?: string;
  } | null>(null);

  useEffect(() => {
    clearCart();
    
    const savedDeliveryMethod = localStorage.getItem("cart-delivery-method") || "standard";
    const orderId = searchParams.get("orderId") || `DBM-${Date.now()}`;
    
    const now = new Date();
    let estimatedDelivery = "";
    
    switch (savedDeliveryMethod) {
      case "pickup":
        estimatedDelivery = ui.estimatedDeliveryToday;
        break;
      case "today":
        const today = new Date(now);
        today.setHours(now.getHours() + 3);
        estimatedDelivery = `${ui.estimatedDeliveryToday.split(" - ")[0]} - ${today.toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", { hour: "2-digit", minute: "2-digit" })}`;
        break;
      case "tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        estimatedDelivery = `${ui.estimatedDeliveryTomorrow} - ${tomorrow.toLocaleDateString(locale === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long" })}`;
        break;
      case "standard":
      default:
        const standard = new Date(now);
        standard.setDate(standard.getDate() + 3);
        estimatedDelivery = standard.toLocaleDateString(locale === "es" ? "es-CO" : "en-US", { weekday: "long", day: "numeric", month: "long" });
        break;
    }
    
    setOrderInfo({
      orderId,
      deliveryMethod: savedDeliveryMethod,
      estimatedDelivery,
      deliveryAddress: savedDeliveryMethod !== "pickup" ? ui.registeredAddress : undefined
    });
    
    localStorage.removeItem("cart-delivery-method");
  }, [clearCart, searchParams, ui, locale]);

  return (
    <section className="bg-[var(--color-cream)] py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-8 md:p-10 shadow-[0_20px_50px_rgba(28,25,23,0.1)]">
          
          <div className="text-center border-b border-[var(--color-primary-pale)] pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
              {ui.title}
            </h1>
            <p className="mt-3 text-lg text-[var(--color-muted)]">
              {ui.subtitle}
            </p>
          </div>

          {orderInfo && (
            <div className="mt-8 space-y-6">
              
              <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-[var(--color-primary-pale)]/20 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                      {ui.orderNumberLabel}
                    </p>
                    <p className="mt-1 text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                      {orderInfo.orderId}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                      {ui.dateLabel}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-dark)]">
                      {new Date().toLocaleDateString(locale === "es" ? "es-CO" : "en-US", { 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric" 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                
                <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)]">
                      <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-dark)]">
                        {orderInfo.deliveryMethod === "pickup" ? ui.deliveryTypePickup : ui.deliveryTypeDelivery}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {orderInfo.deliveryAddress || ui.storeAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)]">
                      <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-dark)]">{ui.estimatedDeliveryLabel}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)] capitalize">
                        {orderInfo.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  {ui.nextStepsTitle}
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">
                      1
                    </span>
                    <p className="text-sm text-[var(--color-muted)]">
                      {ui.nextStepEmailConfirmation}
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">
                      2
                    </span>
                    <p className="text-sm text-[var(--color-muted)]">
                      {ui.nextStepPreparation}
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-xs font-bold text-[var(--color-primary)]">
                      3
                    </span>
                    <p className="text-sm text-[var(--color-muted)]">
                      {orderInfo.deliveryMethod === "pickup" 
                        ? ui.nextStepPickupNotification
                        : ui.nextStepDeliveryNotification
                      }
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center border-t border-[var(--color-primary-pale)] pt-8">
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
  );
}
