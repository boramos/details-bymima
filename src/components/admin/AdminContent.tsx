"use client";

import { useState } from "react";
import { AdminContent, Locale } from "./admin-types";
import { DynamicJsonForm } from "./DynamicJsonForm";

function ContentCard({ item, locale, onSaved }: { item: AdminContent; locale: Locale; onSaved: (nextValue: string) => void }) {
  const [value, setValue] = useState(item.value);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const parsed = JSON.parse(value) as unknown;
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey: item.sectionKey, locale, value: parsed }),
      });

      if (!response.ok) throw new Error("Unable to save content");

      onSaved(value);
      setMessage("Saved");
    } catch {
      setMessage("Invalid JSON");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-[family-name:var(--font-playfair)] text-xl text-slate-900">{item.sectionKey}</h3>
        <button type="button" onClick={() => void save()} disabled={busy} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-60">
          {busy ? "Saving..." : "Save section"}
        </button>
      </div>
      <div className="max-h-[600px] overflow-y-auto rounded-xl border border-rose-100 p-4">
        <DynamicJsonForm initialJson={value} onChange={setValue} />
      </div>
      <p className="mt-3 text-xs text-slate-500">{message ?? `Editing ${locale.toUpperCase()} payload`}</p>
    </article>
  );
}

export function AdminContentPage({ initialContent, locale }: { initialContent: AdminContent[]; locale: Locale }) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div id="content" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Contenido editable</h2>
            <p className="mt-1 text-sm text-slate-600">Edita HomeBanner, Best Sellers, About y Contact en el idioma actual. El otro idioma se completa automáticamente al guardar.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{locale.toUpperCase()}</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {content.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              locale={locale}
              onSaved={(nextValue) => {
                setContent((current) => current.map((section) => (section.id === item.id ? { ...section, value: nextValue } : section)));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
