"use client";

import { useState } from "react";
import { AdminPromo, Locale, PromoDraft, promoToDraft } from "./admin-types";

function PromoEditor({
  draft,
  onChange,
  onCancel,
  onSubmit,
  mode,
  busy,
}: {
  draft: PromoDraft;
  onChange: (draft: PromoDraft) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  mode: "create" | "edit";
  busy: boolean;
}) {
  const updateField = <K extends keyof PromoDraft>(key: K, value: PromoDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <div className="rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-[0_20px_48px_rgba(28,25,23,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-slate-900">{mode === "create" ? "Create promo" : "Edit promo"}</h3>
          <p className="mt-1 text-sm text-slate-500">Promo sections appear on the home page and can be localized independently.</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full border border-rose-100 px-4 py-2 text-sm text-slate-500 transition hover:border-rose-200 hover:text-slate-900">Cancel</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {([
          ["pageKey", "Page key"],
          ["badge", "Badge"],
          ["title", "Title"],
          ["ctaLabel", "CTA label"],
          ["ctaHref", "CTA href"],
          ["backgroundClass", "Background classes"],
          ["sortOrder", "Sort order"],
        ] as const).map(([key]) => (
          <div key={key} className="space-y-2 text-sm text-slate-900">
            <input
              value={draft[key]}
              onChange={(event) => updateField(key, event.target.value)}
              placeholder={key === "pageKey" ? (draft.locale === "es" ? "Clave de página" : "Page key") : key === "badge" ? (draft.locale === "es" ? "Etiqueta" : "Badge") : key === "title" ? (draft.locale === "es" ? "Título" : "Title") : key === "ctaLabel" ? (draft.locale === "es" ? "Texto del botón" : "CTA label") : key === "ctaHref" ? (draft.locale === "es" ? "Enlace del botón" : "CTA href") : key === "backgroundClass" ? (draft.locale === "es" ? "Clases de fondo" : "Background classes") : (draft.locale === "es" ? "Orden" : "Sort order")}
              className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>
        ))}

        <div className="space-y-2 text-sm text-slate-900">
          <select value={draft.locale} onChange={(event) => updateField("locale", event.target.value as Locale)} className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100">
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="space-y-2 text-sm text-slate-900 md:col-span-2">
          <textarea
            value={draft.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            placeholder={draft.locale === "es" ? "Descripción" : "Description"}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-900">
          <input type="checkbox" checked={draft.active} onChange={(event) => updateField("active", event.target.checked)} className="h-4 w-4 rounded border-rose-200 text-rose-700 focus:ring-rose-200" />
          Active promo
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={() => void onSubmit()} disabled={busy} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60">
          {busy ? "Saving..." : mode === "create" ? "Create promo" : "Save promo"}
        </button>
      </div>
    </div>
  );
}

export function AdminPromosPage({ initialPromos, locale }: { initialPromos: AdminPromo[]; locale: Locale }) {
  const [promos, setPromos] = useState(initialPromos);
  const [promoMode, setPromoMode] = useState<"create" | "edit" | null>(null);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoDraft, setPromoDraft] = useState<PromoDraft>(promoToDraft(locale));
  const [promoBusy, setPromoBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const openCreatePromo = () => {
    setPromoMode("create");
    setEditingPromoId(null);
    setPromoDraft(promoToDraft(locale));
  };

  const openEditPromo = (promo: AdminPromo) => {
    setPromoMode("edit");
    setEditingPromoId(promo.id);
    setPromoDraft(promoToDraft(promo.locale as Locale, promo));
  };

  const savePromo = async () => {
    setPromoBusy(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...promoDraft,
        sortOrder: Number(promoDraft.sortOrder),
      };

      const response = await fetch(promoMode === "create" ? "/api/admin/promos" : `/api/admin/promos/${editingPromoId}`, {
        method: promoMode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to save promo");

      const data = (await response.json()) as { data: { source: AdminPromo } };
      setPromos((current) => promoMode === "create"
        ? [data.data.source, ...current]
        : current.map((promo) => (promo.id === data.data.source.id ? data.data.source : promo)));
      setPromoMode(null);
      setEditingPromoId(null);
      setStatusMessage("Promo saved");
    } catch {
      setStatusMessage("Unable to save promo");
    } finally {
      setPromoBusy(false);
    }
  };

  const deletePromo = async (promo: AdminPromo) => {
    const response = await fetch(`/api/admin/promos/${promo.id}`, { method: "DELETE" });
    if (response.ok) {
      setPromos((current) => current.filter((item) => item.id !== promo.id));
      setStatusMessage("Promo deleted");
    } else {
      setStatusMessage("Unable to delete promo");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {statusMessage && <p className="text-sm font-medium text-rose-600">{statusMessage}</p>}
        
        <div id="promos" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Publicidad y promos</h2>
            <p className="mt-1 text-sm text-slate-600">Administra bloques promocionales del home en el idioma actual. El segundo idioma se genera automáticamente.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{locale.toUpperCase()}</span>
            <button type="button" onClick={openCreatePromo} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Nueva promo</button>
          </div>
        </div>

        {promoMode && (
          <PromoEditor
            draft={promoDraft}
            onChange={setPromoDraft}
            onCancel={() => setPromoMode(null)}
            onSubmit={savePromo}
            mode={promoMode}
            busy={promoBusy}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {promos.map((promo) => (
            <article key={promo.id} className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {promo.badge && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">{promo.badge}</p>}
                  <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl text-slate-900">{promo.title}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${promo.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{promo.active ? "Active" : "Hidden"}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{promo.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-rose-500">{promo.pageKey} · order {promo.sortOrder}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{promo.ctaLabel ?? "No CTA"}</span>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEditPromo(promo)} className="text-slate-900 transition hover:text-slate-700">Edit</button>
                  <button type="button" onClick={() => void deletePromo(promo)} className="text-red-600 transition hover:text-red-800">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
