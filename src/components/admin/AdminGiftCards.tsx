"use client";

import { useState } from "react";
import type { GiftCardCatalogWithParsedFields, GiftCardWithRedemptions } from "@/services/GiftCardService";
import type { Locale } from "@/lib/i18n";

interface CatalogDraft {
  key: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  active: boolean;
  allowCustom: boolean;
  presetAmounts: string;
  minCustomAmount: number;
  maxCustomAmount: number;
}

function emptyCatalogDraft(): CatalogDraft {
  return {
    key: "",
    nameEs: "",
    nameEn: "",
    descriptionEs: "",
    descriptionEn: "",
    active: true,
    allowCustom: true,
    presetAmounts: "10,20,50,100",
    minCustomAmount: 10,
    maxCustomAmount: 500,
  };
}

interface GiftCardDraft {
  catalogId: string;
  initialAmountUsd: number;
  recipientName: string;
  recipientEmail: string;
  message: string;
  expiresAt: string;
}

function emptyCardDraft(): GiftCardDraft {
  return {
    catalogId: "",
    initialAmountUsd: 50,
    recipientName: "",
    recipientEmail: "",
    message: "",
    expiresAt: "",
  };
}

interface Props {
  initialCatalogs: GiftCardCatalogWithParsedFields[];
  initialGiftCards: GiftCardWithRedemptions[];
  locale: Locale;
}

export function AdminGiftCards({ initialCatalogs, initialGiftCards, locale }: Props) {
  const [catalogs, setCatalogs] = useState(initialCatalogs);
  const [giftCards, setGiftCards] = useState(initialGiftCards);
  const [activeTab, setActiveTab] = useState<"cards" | "catalogs">("cards");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [catalogMode, setCatalogMode] = useState<"create" | "edit" | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft>(emptyCatalogDraft());
  const [catalogBusy, setCatalogBusy] = useState(false);

  const [cardMode, setCardMode] = useState<"create" | null>(null);
  const [cardDraft, setCardDraft] = useState<GiftCardDraft>(emptyCardDraft());
  const [cardBusy, setCardBusy] = useState(false);

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGiftCards = giftCards.filter((card) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.code.toLowerCase().includes(q) ||
      (card.recipientName && card.recipientName.toLowerCase().includes(q)) ||
      (card.recipientEmail && card.recipientEmail.toLowerCase().includes(q))
    );
  });

  const openCreateCatalog = () => {
    setCatalogMode("create");
    setEditingCatalogId(null);
    setCatalogDraft(emptyCatalogDraft());
  };

  const openEditCatalog = (catalog: GiftCardCatalogWithParsedFields) => {
    setCatalogMode("edit");
    setEditingCatalogId(catalog.id);
    setCatalogDraft({
      key: catalog.key,
      nameEs: catalog.nameEs,
      nameEn: catalog.nameEn,
      descriptionEs: catalog.descriptionEs,
      descriptionEn: catalog.descriptionEn,
      active: catalog.active,
      allowCustom: catalog.allowCustom,
      presetAmounts: catalog.presetAmounts.join(","),
      minCustomAmount: catalog.minCustomAmount,
      maxCustomAmount: catalog.maxCustomAmount,
    });
  };

  const saveCatalog = async () => {
    setCatalogBusy(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...catalogDraft,
        presetAmounts: catalogDraft.presetAmounts
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => !isNaN(n) && n > 0),
      };

      const url = catalogMode === "create"
        ? "/api/admin/gift-card-catalogs"
        : `/api/admin/gift-card-catalogs/${editingCatalogId}`;
      const method = catalogMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save catalog");

      const data = (await res.json()) as { data: GiftCardCatalogWithParsedFields };

      if (catalogMode === "create") {
        setCatalogs((prev) => [...prev, data.data]);
      } else {
        setCatalogs((prev) => prev.map((c) => (c.id === data.data.id ? data.data : c)));
      }

      setCatalogMode(null);
      setStatusMessage("Catalog saved");
    } catch {
      setStatusMessage("Unable to save catalog");
    } finally {
      setCatalogBusy(false);
    }
  };

  const deleteCatalog = async (id: string) => {
    setStatusMessage(null);
    const res = await fetch(`/api/admin/gift-card-catalogs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
      setStatusMessage("Catalog removed");
    } else {
      setStatusMessage("Unable to remove catalog");
    }
  };

  const saveCard = async () => {
    setCardBusy(true);
    setStatusMessage(null);

    try {
      const payload = {
        catalogId: cardDraft.catalogId || null,
        initialAmountUsd: cardDraft.initialAmountUsd,
        recipientName: cardDraft.recipientName || null,
        recipientEmail: cardDraft.recipientEmail || null,
        message: cardDraft.message || null,
        expiresAt: cardDraft.expiresAt ? new Date(cardDraft.expiresAt).toISOString() : null,
      };

      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create gift card");

      const data = (await res.json()) as { data: GiftCardWithRedemptions };
      setGiftCards((prev) => [data.data, ...prev]);
      setCardMode(null);
      setCardDraft(emptyCardDraft());
      setStatusMessage("Gift card created");
    } catch {
      setStatusMessage("Unable to create gift card");
    } finally {
      setCardBusy(false);
    }
  };

  const revokeCard = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres revocar esta gift card? No se podrá usar el saldo restante.")) {
      return;
    }
    
    setStatusMessage(null);
    const res = await fetch(`/api/admin/gift-cards/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setGiftCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "INACTIVE" } : c)),
      );
      setStatusMessage("Gift card revocada");
    } else {
      setStatusMessage("No se pudo revocar la gift card");
    }
  };

  const statusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          ACTIVA
        </span>
      );
    }
    if (status === "REDEEMED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
          CANJEADA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
        INACTIVA
      </span>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {statusMessage && (
          <p className="text-sm font-medium text-rose-600">{statusMessage}</p>
        )}

        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Gift Cards</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona catálogos y gift cards emitidas. Crea, desactiva y revisa redemptions.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setActiveTab("catalogs"); openCreateCatalog(); }}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + Catálogo
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("cards"); setCardMode("create"); setCardDraft(emptyCardDraft()); }}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Asignar a Cliente
            </button>
          </div>
        </div>

        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {(["cards", "catalogs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "cards" ? `Gift Cards (${giftCards.length})` : `Catálogos (${catalogs.length})`}
            </button>
          ))}
        </div>

        {activeTab === "cards" && (
          <div className="space-y-4">
            {cardMode === "create" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <h3 className="font-semibold text-slate-900">Asignar a Cliente</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <input
                      type="email"
                      value={cardDraft.recipientEmail}
                      onChange={(e) => setCardDraft((d) => ({ ...d, recipientEmail: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="cliente@ejemplo.com"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Se le enviará el código a este email si lo completas.</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={cardDraft.initialAmountUsd}
                      onChange={(e) => setCardDraft((d) => ({ ...d, initialAmountUsd: Number(e.target.value) }))}
                      placeholder={locale === "es" ? "Monto inicial (USD)" : "Initial amount (USD)"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={cardDraft.expiresAt}
                      onChange={(e) => setCardDraft((d) => ({ ...d, expiresAt: e.target.value }))}
                      placeholder={locale === "es" ? "Fecha de expiración" : "Expiration date"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div>
                    <select
                      value={cardDraft.catalogId}
                      onChange={(e) => setCardDraft((d) => ({ ...d, catalogId: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="">Sin catálogo</option>
                      {catalogs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {locale === "es" ? c.nameEs : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cardDraft.recipientName}
                      onChange={(e) => setCardDraft((d) => ({ ...d, recipientName: e.target.value }))}
                      placeholder={locale === "es" ? "Nombre destinatario" : "Recipient name"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      rows={3}
                      value={cardDraft.message}
                      onChange={(e) => setCardDraft((d) => ({ ...d, message: e.target.value }))}
                      placeholder={locale === "es" ? "Mensaje" : "Message"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={cardBusy}
                    onClick={() => void saveCard()}
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {cardBusy ? "Creando…" : "Asignar a Cliente"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardMode(null)}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {!cardMode && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-sm"
                />
              </div>
            )}

            {filteredGiftCards.map((card) => (
              <article key={card.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm font-bold tracking-widest text-slate-900">{card.code}</p>
                      {statusBadge(card.status)}
                    </div>
                    {card.catalog && (
                      <p className="mt-1 text-xs font-medium text-slate-500">{locale === "es" ? card.catalog.nameEs : card.catalog.nameEn}</p>
                    )}
                    <div className="mt-2 space-y-0.5">
                      {card.recipientName && (
                        <p className="text-sm text-slate-600">Para: {card.recipientName}</p>
                      )}
                      {card.recipientEmail && (
                        <p className="text-sm text-slate-500">{card.recipientEmail}</p>
                      )}
                      <p className="text-xs text-slate-400">Creada: {new Date(card.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950">${card.remainingAmountUsd}</p>
                    <p className="text-xs text-slate-500">de ${card.initialAmountUsd}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)}
                    className="font-medium text-slate-500 transition hover:text-slate-800"
                  >
                    {card.redemptions.length} redemption{card.redemptions.length !== 1 ? "s" : ""}
                    {expandedCardId === card.id ? " ▲" : " ▼"}
                  </button>
                  {card.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => void revokeCard(card.id)}
                      className="font-medium text-red-600 transition hover:text-red-800"
                    >
                      Revocar
                    </button>
                  )}
                </div>

                {expandedCardId === card.id && card.redemptions.length > 0 && (
                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 px-4 py-3">
                    {card.redemptions.map((r) => (
                      <div key={r.id} className="flex justify-between text-xs text-slate-600">
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        <span className="font-medium">-${r.amountUsd}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {filteredGiftCards.length === 0 && cardMode !== "create" && (
              <p className="py-12 text-center text-sm text-slate-500">
                {searchQuery ? "No se encontraron gift cards." : "No hay gift cards emitidas aún."}
              </p>
            )}
          </div>
        )}

        {activeTab === "catalogs" && (
          <div className="space-y-4">
            {catalogMode && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900">
                  {catalogMode === "create" ? "Nuevo Catálogo" : "Editar Catálogo"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      { field: "key" as const, label: "Key (único)" },
                      { field: "nameEs" as const, label: "Nombre (ES)" },
                      { field: "nameEn" as const, label: "Name (EN)" },
                    ] as const
                  ).map(({ field }) => (
                    <div key={field}>
                      <input
                        type="text"
                        value={catalogDraft[field]}
                        onChange={(e) => setCatalogDraft((d) => ({ ...d, [field]: e.target.value }))}
                        placeholder={field === "key" ? (locale === "es" ? "Clave única" : "Unique key") : field === "nameEs" ? (locale === "es" ? "Nombre en español" : "Spanish name") : (locale === "es" ? "Nombre en inglés" : "English name")}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>
                  ))}
                  <div>
                    <input
                      type="text"
                      value={catalogDraft.presetAmounts}
                      onChange={(e) => setCatalogDraft((d) => ({ ...d, presetAmounts: e.target.value }))}
                      placeholder={locale === "es" ? "Montos preset separados por coma" : "Preset amounts separated by commas"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={catalogDraft.descriptionEs}
                      onChange={(e) => setCatalogDraft((d) => ({ ...d, descriptionEs: e.target.value }))}
                      placeholder={locale === "es" ? "Descripción (ES)" : "Description (ES)"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={catalogDraft.descriptionEn}
                      onChange={(e) => setCatalogDraft((d) => ({ ...d, descriptionEn: e.target.value }))}
                      placeholder={locale === "es" ? "Descripción (EN)" : "Description (EN)"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={catalogDraft.active}
                        onChange={(e) => setCatalogDraft((d) => ({ ...d, active: e.target.checked }))}
                        className="rounded"
                      />
                      Activo
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={catalogDraft.allowCustom}
                        onChange={(e) => setCatalogDraft((d) => ({ ...d, allowCustom: e.target.checked }))}
                        className="rounded"
                      />
                      Permitir monto personalizado
                    </label>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1">
                      <input
                        type="number"
                        min={1}
                        value={catalogDraft.minCustomAmount}
                        onChange={(e) => setCatalogDraft((d) => ({ ...d, minCustomAmount: Number(e.target.value) }))}
                        placeholder={locale === "es" ? "Monto mín. custom" : "Min custom amount"}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min={1}
                        value={catalogDraft.maxCustomAmount}
                        onChange={(e) => setCatalogDraft((d) => ({ ...d, maxCustomAmount: Number(e.target.value) }))}
                        placeholder={locale === "es" ? "Monto máx. custom" : "Max custom amount"}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={catalogBusy}
                    onClick={() => void saveCatalog()}
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {catalogBusy ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogMode(null)}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {catalogs.map((catalog) => (
              <article key={catalog.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {locale === "es" ? catalog.nameEs : catalog.nameEn}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {locale === "es" ? catalog.descriptionEs : catalog.descriptionEn}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{catalog.key}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    <span className={`rounded-full px-2.5 py-1 ${catalog.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                      {catalog.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>Montos: {catalog.presetAmounts.map((a) => `$${a}`).join(", ")}</span>
                  {catalog.allowCustom && (
                    <span>· Custom: ${catalog.minCustomAmount}–${catalog.maxCustomAmount}</span>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => openEditCatalog(catalog)}
                    className="text-slate-700 transition hover:text-slate-950"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCatalog(catalog.id)}
                    className="text-red-600 transition hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}

            {catalogs.length === 0 && !catalogMode && (
              <p className="py-12 text-center text-sm text-slate-500">No hay catálogos aún.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
