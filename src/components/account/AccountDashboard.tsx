"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LogoutButton } from "@/components/auth/LogoutButton";

import SecurityTab from "./tabs/SecurityTab";
import OrdersTab from "./tabs/OrdersTab";
import AddressesTab from "./tabs/AddressesTab";
import PaymentsTab from "./tabs/PaymentsTab";
import WishlistTab from "./tabs/WishlistTab";
import SubscriptionsTab from "./tabs/SubscriptionsTab";

type OrderItem = { id: string; productName: string; quantity: number; product?: { imagePath: string | null; imageEmoji: string; gradientClass: string; slug: string } };
type Order = { id: string; orderNumber: string; status: string; createdAt: string | Date; deliveryMethod: string; totalCop: number; items: OrderItem[]; };
type Address = { id: string; label: string | null; firstName: string | null; lastName: string | null; street: string; apartment: string | null; city: string; state: string | null; postalCode: string; country: string; phone: string | null; deliveryInstructions: string | null; isDefault: boolean; };

type AccountDashboardProps = {
  initialData: {
    sessionUser: { id?: string; name?: string | null; email?: string | null; image?: string | null; role?: string };
    user: { name?: string | null; email?: string | null; phone?: string | null; locale?: string | null; twoFactorEnabled?: boolean; twoFactorPhone?: string | null; addresses: Address[] };
    orders: Order[];
  };
  ui: Record<string, string>;
  locale: "es" | "en";
};

export default function AccountDashboard({ initialData, ui, locale }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState("security");
  const { sessionUser } = initialData;

  const [avatarSrc, setAvatarSrc] = useState<string | null>(sessionUser.image ?? null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setAvatarError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");
      setAvatarSrc(data.data?.path ?? null);
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const roleLabel = sessionUser.role === "admin" ? ui.accountRoleAdmin : ui.accountRoleCustomer;
  const initials = (sessionUser.name ?? sessionUser.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const tabs = [
    { id: "security", label: locale === "es" ? "Inicio de Sesión y Seguridad" : "Login & Security" },
    { id: "orders", label: locale === "es" ? "Tus Pedidos" : "Your Orders" },
    { id: "addresses", label: locale === "es" ? "Tus Direcciones" : "Your Addresses" },
    { id: "payments", label: locale === "es" ? "Tus Pagos" : "Your Payments" },
    { id: "lists", label: locale === "es" ? "Tus Listas" : "Your Lists" },
    { id: "subscriptions", label: locale === "es" ? "Suscripciones" : "Subscriptions" },
  ];

  const getTabFromHash = useCallback(() => {
    const hash = window.location.hash.replace("#", "");
    const valid = ["security", "orders", "addresses", "payments", "lists", "subscriptions"];
    return valid.includes(hash) ? hash : "security";
  }, []);

  useEffect(() => {
    setActiveTab(getTabFromHash());

    function onHashChange() {
      setActiveTab(getTabFromHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [getTabFromHash]);

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up space-y-6">
      <div className="rounded-3xl border border-[var(--color-primary-pale)] bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary-pale)] px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
          <div className="absolute top-6 right-6">
            <LogoutButton className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-light)] bg-white/80 px-4 py-1.5 text-xs font-medium text-[var(--color-dark)] transition-all hover:bg-white hover:text-[var(--color-primary)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {ui.logoutButton || (locale === "es" ? "Cerrar sesión" : "Logout")}
            </LogoutButton>
          </div>

          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Subir foto de perfil"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="relative h-[72px] w-[72px] rounded-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Cambiar foto de perfil"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={sessionUser.name ?? ""}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-full ring-4 ring-white/70 object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-[72px] w-[72px] rounded-full bg-[var(--color-primary)] ring-4 ring-white/70 flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-playfair)]">
                  {avatarLoading ? (
                    <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : initials}
                </div>
              )}
              <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                {avatarLoading ? (
                  <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </span>
            </button>
            {avatarError && (
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-red-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                {avatarError}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
              {ui.accountGreeting}, {sessionUser.name ?? sessionUser.email}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">{sessionUser.email}</p>
            <span className="inline-flex items-center rounded-full bg-white/60 border border-white/70 px-3 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-white border border-[var(--color-primary-pale)] text-[var(--color-dark)] hover:border-[var(--color-primary-light)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-primary-pale)] bg-white shadow-sm p-6 sm:p-8">
        {activeTab === "security" && <SecurityTab sessionUser={sessionUser} initialUser={initialData.user} locale={locale} />}
        {activeTab === "orders" && <OrdersTab initialOrders={initialData.orders} locale={locale} />}
        {activeTab === "addresses" && <AddressesTab initialAddresses={initialData.user.addresses} locale={locale} userName={sessionUser.name ?? sessionUser.email ?? ""} />}
        {activeTab === "payments" && <PaymentsTab locale={locale} />}
        {activeTab === "lists" && <WishlistTab locale={locale} />}
        {activeTab === "subscriptions" && <SubscriptionsTab locale={locale} />}
      </div>
    </div>
  );
}
