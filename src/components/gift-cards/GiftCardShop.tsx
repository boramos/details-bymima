"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftCardCatalogWithParsedFields } from "@/services/GiftCardService";
import type { Locale } from "@/lib/i18n";

type DeliveryMethod = "EMAIL" | "TEXT" | "PHYSICAL";

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Props {
  catalogs: GiftCardCatalogWithParsedFields[];
  locale: Locale;
}

const GRADIENTS = [
  "from-rose-400 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-violet-500 to-purple-700",
];

const EMOJIS = ["🌸", "🌿", "🌼", "💜"];

const CARD = "rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]";
const INPUT =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100";

export function GiftCardShop({ catalogs, locale }: Props) {
  const router = useRouter();
  const isMultiple = catalogs.length > 1;
  const initialCatalog = catalogs.length > 0 ? catalogs[0] : null;

  const [selectedCatalog, setSelectedCatalog] = useState<GiftCardCatalogWithParsedFields | null>(initialCatalog);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("EMAIL");
  const [recipients, setRecipients] = useState<Recipient[]>([{ id: "0", name: "", email: "" }]);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedAmount = selectedPreset ?? (customAmount ? Number(customAmount) : null);

  const handleMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    if (method === "EMAIL") {
      setRecipients([{ id: Date.now().toString(), name: "", email: "" }]);
    } else if (method === "TEXT") {
      setRecipients([{ id: Date.now().toString(), name: "", phone: "" }]);
    } else {
      setRecipients([{ id: Date.now().toString(), name: "", address: "" }]);
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    setRecipients((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addRecipient = () => {
    if (recipients.length >= 5) return;
    setRecipients((prev) => [...prev, { id: Date.now().toString(), name: "", phone: "" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (catalogs.length > 0 && !selectedCatalog) {
      setError(locale === "es" ? "Selecciona un estilo de tarjeta" : "Please select a card style");
      return;
    }
    if (!resolvedAmount || resolvedAmount <= 0) {
      setError(locale === "es" ? "Selecciona o ingresa un monto" : "Please select or enter an amount");
      return;
    }
    if (
      selectedCatalog?.allowCustom &&
      customAmount &&
      (resolvedAmount < selectedCatalog.minCustomAmount || resolvedAmount > selectedCatalog.maxCustomAmount)
    ) {
      setError(
        locale === "es"
          ? `Monto entre $${selectedCatalog.minCustomAmount} y $${selectedCatalog.maxCustomAmount}`
          : `Amount must be between $${selectedCatalog.minCustomAmount} and $${selectedCatalog.maxCustomAmount}`,
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!senderName || senderName.trim().length < 2) {
      setError(locale === "es" ? "Ingresa tu nombre" : "Enter your name");
      return;
    }
    if (!senderEmail || !emailRegex.test(senderEmail)) {
      setError(locale === "es" ? "Ingresa un correo válido" : "Enter a valid email");
      return;
    }
    for (const rec of recipients) {
      if (!rec.name || rec.name.trim().length < 2) {
        setError(locale === "es" ? "Ingresa el nombre del destinatario" : "Enter recipient name");
        return;
      }
      if (deliveryMethod === "EMAIL" && (!rec.email || !emailRegex.test(rec.email))) {
        setError(locale === "es" ? "Ingresa un correo válido para el destinatario" : "Enter a valid recipient email");
        return;
      }
      if (deliveryMethod === "TEXT" && (!rec.phone || rec.phone.replace(/\D/g, "").length < 7)) {
        setError(locale === "es" ? "Ingresa un teléfono válido para el destinatario" : "Enter a valid recipient phone");
        return;
      }
    }

    setBusy(true);
    sessionStorage.setItem(
      "gift-card-draft",
      JSON.stringify({
        catalogId: selectedCatalog?.id ?? null,
        amount: resolvedAmount,
        deliveryMethod,
        recipients,
        message,
        senderName,
        senderEmail,
        senderPhone: senderPhone || undefined,
      }),
    );
    router.push("/checkout");
  };

  const defaultPresets = [25, 50, 100, 200];
  const presets = selectedCatalog?.presetAmounts ?? defaultPresets;

  const submitLabel = (() => {
    if (busy) return locale === "es" ? "Cargando…" : "Loading…";
    if (!resolvedAmount) return locale === "es" ? "Selecciona un monto →" : "Select an amount →";
    if (recipients.length > 1)
      return `${locale === "es" ? "Continuar" : "Continue"} · $${resolvedAmount} × ${recipients.length} = $${resolvedAmount * recipients.length}`;
    return `${locale === "es" ? "Continuar" : "Continue"} · $${resolvedAmount}`;
  })();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <section className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-primary)]">
            {locale === "es" ? "Regala experiencias" : "Give experiences"}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight text-[var(--color-dark)]">
            Gift Cards
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-500">
            {locale === "es"
              ? "El regalo perfecto para quien lo tiene todo."
              : "The perfect gift for someone who has everything."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-10 sm:py-12">
        <form onSubmit={handleSubmit} className="space-y-5">

          {isMultiple && (
            <div className={CARD}>
              <SectionLabel label={locale === "es" ? "Estilo" : "Style"} />
              <div className="grid gap-3 sm:grid-cols-2">
                {catalogs.map((catalog, i) => {
                  const gradient = GRADIENTS[i % GRADIENTS.length];
                  const emoji = EMOJIS[i % EMOJIS.length];
                  const isSelected = selectedCatalog?.id === catalog.id;
                  return (
                    <button
                      key={catalog.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatalog(catalog);
                        setSelectedPreset(null);
                        setCustomAmount("");
                      }}
                      className={`group flex flex-col items-center rounded-xl border-2 p-3 transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-rose-50/40 shadow-sm"
                          : "border-slate-200 bg-white hover:border-rose-200"
                      }`}
                    >
                      <div className={`relative w-full overflow-hidden rounded-lg bg-gradient-to-br ${gradient} aspect-[1.58/1] p-4`}>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),transparent)]" />
                        <div className="relative z-10 flex h-full flex-col justify-between text-white">
                          <div className="flex items-start justify-between">
                            <span className="font-[family-name:var(--font-playfair)] text-sm font-bold tracking-wide">MIMA</span>
                            <span className="text-lg">{emoji}</span>
                          </div>
                          <p className="text-left text-[10px] font-semibold uppercase tracking-wider opacity-90">
                            {locale === "es" ? catalog.nameEs : catalog.nameEn}
                          </p>
                        </div>
                      </div>
                      <p className={`mt-2 text-xs font-semibold ${isSelected ? "text-[var(--color-primary)]" : "text-slate-500"}`}>
                        {locale === "es" ? catalog.nameEs : catalog.nameEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={CARD}>
            <SectionLabel label={locale === "es" ? "Monto" : "Amount"} />
            <div className="flex flex-wrap gap-2.5">
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(amount);
                    setCustomAmount("");
                  }}
                  className={`rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all duration-150 ${
                    selectedPreset === amount
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  ${amount}
                </button>
              ))}
              {(!selectedCatalog || selectedCatalog.allowCustom) && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder={locale === "es" ? "Otro" : "Custom"}
                    min={selectedCatalog?.minCustomAmount ?? 10}
                    max={selectedCatalog?.maxCustomAmount ?? 1000}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPreset(null);
                    }}
                    className={`w-36 rounded-full border-2 py-2.5 pl-8 pr-4 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      customAmount
                        ? "border-[var(--color-primary)] bg-rose-50 text-[var(--color-primary)]"
                        : "border-slate-300 bg-white text-slate-700 placeholder:text-slate-400 hover:border-rose-200"
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={CARD}>
            <SectionLabel label={locale === "es" ? "Método de entrega" : "Delivery method"} />
            <div className="grid grid-cols-3 gap-3">
              {(["EMAIL", "TEXT", "PHYSICAL"] as DeliveryMethod[]).map((method) => {
                const isSelected = deliveryMethod === method;
                const map = {
                  EMAIL: { icon: "📧", title: "Email", desc: locale === "es" ? "Inmediata" : "Instant" },
                  TEXT:  { icon: "💬", title: "SMS",   desc: locale === "es" ? "Inmediata" : "Instant" },
                  PHYSICAL: {
                    icon: "📦",
                    title: locale === "es" ? "Física" : "Physical",
                    desc: locale === "es" ? "5–7 días" : "5–7 days",
                  },
                } as const;
                const { icon, title, desc } = map[method];
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleMethodChange(method)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 px-2 py-4 text-center transition-all duration-150 ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-rose-50/60"
                        : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/30"
                    }`}
                  >
                    <span className="mb-1.5 text-2xl">{icon}</span>
                    <span className={`text-xs font-bold ${isSelected ? "text-[var(--color-primary)]" : "text-slate-700"}`}>{title}</span>
                    <span className={`mt-0.5 text-[10px] ${isSelected ? "text-rose-400" : "text-slate-400"}`}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={CARD}>
            <div className="flex items-center justify-between">
              <SectionLabel label={locale === "es" ? "Destinatario(s)" : "Recipient(s)"} />
              {deliveryMethod === "TEXT" && recipients.length < 5 && (
                <button
                  type="button"
                  onClick={addRecipient}
                  className="text-[11px] font-bold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
                >
                  + {locale === "es" ? "Agregar" : "Add"}
                </button>
              )}
            </div>
            <div className="space-y-5">
              {recipients.map((rec, i) => (
                <div key={rec.id} className={`relative ${i > 0 ? "border-t border-slate-100 pt-5" : ""}`}>
                  {deliveryMethod === "TEXT" && recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecipient(i)}
                      className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 text-xs font-bold transition-colors"
                      aria-label={locale === "es" ? "Eliminar" : "Remove"}
                    >
                      ×
                    </button>
                  )}
                  <div className={`grid gap-4 sm:grid-cols-2 ${deliveryMethod === "TEXT" && recipients.length > 1 ? "pr-8 sm:pr-0" : ""}`}>
                    <div>
                      <input
                        id={`rec-name-${i}`}
                        type="text"
                        required
                        value={rec.name}
                        onChange={(e) => updateRecipient(i, "name", e.target.value)}
                        className={INPUT}
                        placeholder={locale === "es" ? "Nombre completo" : "Full name"}
                      />
                    </div>
                    {deliveryMethod === "EMAIL" && (
                      <div>
                        <input
                          id={`rec-email-${i}`}
                          type="email"
                          required
                          value={rec.email ?? ""}
                          onChange={(e) => updateRecipient(i, "email", e.target.value)}
                          className={INPUT}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    )}
                    {deliveryMethod === "TEXT" && (
                      <div>
                        <input
                          id={`rec-phone-${i}`}
                          type="tel"
                          required
                          value={rec.phone ?? ""}
                          onChange={(e) => updateRecipient(i, "phone", e.target.value.replace(/[^\d\s+\-()]/g, ""))}
                          className={INPUT}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    )}
                    {deliveryMethod === "PHYSICAL" && (
                      <div>
                        <input
                          id={`rec-addr-${i}`}
                          type="text"
                          required
                          value={rec.address ?? ""}
                          onChange={(e) => updateRecipient(i, "address", e.target.value)}
                          className={INPUT}
                          placeholder={locale === "es" ? "Calle, ciudad, estado" : "Street, city, state"}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <SectionLabel
              label={locale === "es" ? "Mensaje personal" : "Personal message"}
              hint={locale === "es" ? "Opcional" : "Optional"}
            />
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                locale === "es"
                  ? "Escribe algo especial para acompañar tu regalo…"
                  : "Write something special to go with your gift…"
              }
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className={CARD}>
            <SectionLabel label={locale === "es" ? "Tus datos" : "Your details"} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  id="senderName"
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className={INPUT}
                  placeholder={locale === "es" ? "Tu nombre" : "Your name"}
                />
              </div>
              <div>
                <input
                  id="senderEmail"
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className={INPUT}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  id="senderPhone"
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value.replace(/[^\d\s+\-()]/g, ""))}
                  className={INPUT}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <span className="text-red-400">⚠</span>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[var(--color-primary)] py-4 text-[15px] font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>

          <p className="pb-4 text-center text-[11px] text-slate-400">
            {locale === "es"
              ? "Serás redirigido de forma segura para completar el pago."
              : "You'll be securely redirected to complete payment."}
          </p>
        </form>
      </section>
    </div>
  );
}

function SectionLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">{label}</p>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
  );
}
