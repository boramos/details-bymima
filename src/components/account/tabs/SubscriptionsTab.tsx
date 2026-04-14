"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PassportInfo = {
  id: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  autoRenew: boolean;
  isActive: boolean;
};

type NewsletterInfo = {
  id: string;
  email: string;
  active: boolean;
};

type StoreCredit = {
  id: string;
  amountUsd: number;
  remainingUsd: number;
  reason: string;
  note: string | null;
  status: string;
  expiresAt: string | Date | null;
  createdAt: string | Date;
};

export default function SubscriptionsTab({ locale }: { locale: string }) {
  const isEs = locale === "es";

  const [passport, setPassport] = useState<PassportInfo | null>(null);
  const [newsletter, setNewsletter] = useState<NewsletterInfo | null>(null);
  const [storeCredits, setStoreCredits] = useState<StoreCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [passportRes, subRes, creditRes] = await Promise.all([
          fetch("/api/passport"),
          fetch("/api/user/subscriptions"),
          fetch("/api/user/store-credit")
        ]);

        if (passportRes.ok) {
          const passportJson = await passportRes.json();
          if (passportJson.data) setPassport({ ...passportJson.data, isActive: passportJson.isActive });
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setNewsletter(subData.data?.newsletter ?? null);
        }
        if (creditRes.ok) {
          const creditJson = await creditRes.json();
          setStoreCredits(creditJson.data ?? []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function toggleNewsletter() {
    if (!newsletter) return;
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/user/subscriptions/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !newsletter.active }),
      });
      if (res.ok) {
        setNewsletter({ ...newsletter, active: !newsletter.active });
      }
    } catch {
    } finally {
      setNewsletterLoading(false);
    }
  }

  const daysRemaining = passport?.endDate
    ? Math.max(0, Math.ceil((new Date(passport.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const creditReason: Record<string, string> = {
    REFUND: "Reembolso",
    PROMOTION: "Promoción",
    REFERRAL: "Referido",
    MANUAL: "Crédito especial",
  };

  if (loading) return <p className="text-[var(--color-muted)]">{isEs ? "Cargando..." : "Loading..."}</p>;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
          {isEs ? "Suscripciones" : "Subscriptions"}
        </h2>

        <div className="bg-white rounded-2xl border border-[var(--color-primary-pale)] overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 relative">
            <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-indigo-900 mb-2">MIMA Passport</h3>
            
            {passport && passport.isActive ? (
              <div className="space-y-4">
                <p className="text-indigo-800/80 font-medium">
                  {isEs ? "Disfruta de envíos gratis en todos tus pedidos" : "Enjoy free shipping on all your orders"}
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                    <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">{isEs ? "Estado" : "Status"}</span>
                    <span className="block font-bold text-indigo-900 text-lg">{isEs ? "Activo" : "Active"}</span>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                    <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">{isEs ? "Expira" : "Expires"}</span>
                    <span className="block font-bold text-indigo-900 text-lg">
                      {new Date(passport.endDate).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                    <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">{isEs ? "Tiempo restante" : "Time remaining"}</span>
                    <span className="block font-bold text-indigo-900 text-lg">
                      {daysRemaining} {isEs ? "días" : "days"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-indigo-800/80 font-medium">
                  {isEs ? "No tienes una suscripción activa." : "You don't have an active subscription."}
                </p>
                <Link
                  href="/passport"
                  className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {isEs ? "Obtener Passport por $19.99/año" : "Get Passport for $19.99/year"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-primary-pale)] pt-12">
        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
          {isEs ? "Boletín de noticias" : "Newsletter"}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl border border-[var(--color-primary-pale)] gap-6">
          <div>
            <p className="font-semibold text-[var(--color-dark)] mb-1">
              {isEs ? "Recibe ofertas exclusivas, novedades y el 10% de descuento en tu primera compra" : "Receive exclusive offers, news and 10% off your first purchase"}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {isEs ? "Estado: " : "Status: "}
              <span className={`font-semibold ${newsletter?.active ? 'text-green-600' : 'text-[var(--color-muted)]'}`}>
                {newsletter?.active ? (isEs ? "Suscrito" : "Subscribed") : (isEs ? "No suscrito" : "Not subscribed")}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={toggleNewsletter}
            disabled={newsletterLoading || !newsletter}
            className={`px-6 py-2 font-semibold rounded-full transition-colors shrink-0 whitespace-nowrap disabled:opacity-50 ${
              newsletter?.active
                ? "bg-white border border-[var(--color-primary-pale)] text-[var(--color-dark)] hover:border-[var(--color-primary-light)]"
                : "bg-[var(--color-dark)] text-white hover:bg-black"
            }`}
          >
            {newsletterLoading ? "..." : newsletter?.active ? (isEs ? "Cancelar suscripción" : "Unsubscribe") : (isEs ? "Suscribirse" : "Subscribe")}
          </button>
        </div>
      </section>

      <section className="border-t border-[var(--color-primary-pale)] pt-12">
        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
          {isEs ? "Créditos de tienda" : "Store Credits"}
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          {isEs ? "Créditos que hemos aplicado a tu cuenta por reembolsos o promociones especiales. Son distintos a las tarjetas de regalo que compras para regalar." : "Credits applied to your account from refunds or special promotions. These are different from gift cards you buy for others."}
        </p>

        {storeCredits.length === 0 ? (
          <div className="text-center py-10 bg-[var(--color-cream)] rounded-2xl border border-[var(--color-primary-pale)]">
            <p className="text-[var(--color-dark)]">{isEs ? "No tienes créditos de tienda activos" : "You have no active store credits"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {storeCredits.map((credit) => (
              <div key={credit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-[var(--color-primary-pale)] bg-white gap-4">
                <div>
                  <h4 className="font-bold text-[var(--color-dark)] text-lg">${credit.remainingUsd.toFixed(2)}</h4>
                  <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">
                    {creditReason[credit.reason] || credit.reason}
                  </p>
                  {credit.note && <p className="text-sm text-[var(--color-muted)] mt-1">{credit.note}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                    credit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {credit.status}
                  </span>
                  {credit.expiresAt && (
                    <p className="text-xs text-[var(--color-muted)]">
                      Expira: {new Date(credit.expiresAt).toLocaleDateString(locale)}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Otorgado: {new Date(credit.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
