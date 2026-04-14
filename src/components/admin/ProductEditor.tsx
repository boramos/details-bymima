"use client";

import { ProductDraft } from "./admin-types";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_GRADIENT_OPTIONS,
  PRODUCT_STYLE_OPTIONS,
  PRODUCT_TAG_OPTIONS,
} from "./product-option-sets";

function MultiSelectGroup({
  label,
  options,
  selectedValues,
  onToggle,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-[var(--color-dark)]">{label}</span>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-rose-100 bg-rose-50/20 p-3">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full px-3 py-2 text-xs font-medium transition ${selected ? "bg-slate-950 text-white" : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductEditor({
  draft,
  onChange,
  onCancel,
  onSubmit,
  busy,
  mode,
}: {
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  busy: boolean;
  mode: "create" | "edit";
}) {
  const updateField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const toggleArrayValue = (key: "categories" | "colors" | "styles" | "tags", value: string) => {
    const currentValues = draft[key];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateField(key, nextValues);
  };

  const syncPrimaryImage = (paths: string[]) => {
    const nextPrimary = paths[0] ?? "";
    onChange({
      ...draft,
      imagePaths: paths,
      imagePath: nextPrimary,
    });
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads/product-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = (await response.json()) as { data: { path: string } };
    return data.data.path;
  };

  return (
    <div className="rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-[0_20px_48px_rgba(28,25,23,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--color-dark)]">
            {mode === "create" ? "Create product" : "Edit product"}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Edita solo el idioma actual. El otro idioma se traduce automáticamente al guardar.</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full border border-rose-100 px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-rose-200 hover:text-[var(--color-dark)]">Cancel</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-[var(--color-dark)]">
          <input
            value={draft.slug}
            onChange={(event) => updateField("slug", event.target.value.replace(/[^a-z0-9-]/g, "").toLowerCase())}
            placeholder={draft.locale === "es" ? "slug-del-producto" : "product-slug"}
            required
            minLength={2}
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers and hyphens"
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-2 text-sm text-[var(--color-dark)]">
          <input
            value={draft.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder={draft.locale === "es" ? "Nombre" : "Name"}
            required
            minLength={2}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-2 text-sm text-[var(--color-dark)]">
          <input
            type="number"
            inputMode="numeric"
            value={draft.basePriceCop}
            onChange={(event) => updateField("basePriceCop", event.target.value.replace(/[^\d]/g, ""))}
            placeholder={draft.locale === "es" ? "Precio base (COP)" : "Base price (COP)"}
            required
            min={1}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-2 text-sm text-[var(--color-dark)]">
          <select
            value={draft.gradientClass}
            onChange={(event) => updateField("gradientClass", event.target.value)}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            {PRODUCT_GRADIENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 text-sm text-[var(--color-dark)] md:col-span-2">
          <span className="font-medium">Product Images (up to 5)</span>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {draft.imagePaths.map((path, idx) => (
              <div key={idx} className="relative group">
                <div className="overflow-hidden rounded-2xl border border-rose-100 bg-slate-100 aspect-square">
                  <img src={path || "/uploads/products/product-placeholder.svg"} alt={`Product preview ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const reordered = [draft.imagePaths[idx], ...draft.imagePaths.filter((_, i) => i !== idx)];
                        syncPrimaryImage(reordered);
                      }}
                      className="bg-white rounded-full px-2 py-1 shadow-sm hover:bg-slate-100 text-[10px] font-semibold"
                      title="Set as primary"
                    >
                      Primary
                    </button>
                  )}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newPaths = [...draft.imagePaths];
                        [newPaths[idx - 1], newPaths[idx]] = [newPaths[idx], newPaths[idx - 1]];
                        syncPrimaryImage(newPaths);
                      }}
                      className="bg-white rounded-full p-1 shadow-sm hover:bg-slate-100 text-xs"
                      title="Move left"
                    >
                      ◀
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newPaths = draft.imagePaths.filter((_, i) => i !== idx);
                      syncPrimaryImage(newPaths);
                    }}
                    className="bg-white text-rose-500 rounded-full p-1 shadow-sm hover:bg-rose-50 text-xs"
                    title="Remove"
                  >
                    ✖
                  </button>
                </div>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full">Primary</span>
                )}
              </div>
            ))}
            
            {draft.imagePaths.length === 0 && (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 aspect-square text-xs text-slate-500 md:col-span-1">
                No images yet
              </div>
            )}

            {draft.imagePaths.length < 5 && (
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/50 transition cursor-pointer aspect-square text-rose-400 hover:text-rose-500">
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs font-medium">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    const path = await uploadFile(file);
                    const currentPaths = draft.imagePaths.filter((p) => p !== "/uploads/products/product-placeholder.svg");
                    const newPaths = [...currentPaths, path].slice(0, 5);
                    syncPrimaryImage(newPaths);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="md:col-span-2 grid gap-4">
          <MultiSelectGroup
            label="Categories"
            options={PRODUCT_CATEGORY_OPTIONS}
            selectedValues={draft.categories}
            onToggle={(value) => toggleArrayValue("categories", value)}
          />
          <MultiSelectGroup
            label="Colors"
            options={PRODUCT_COLOR_OPTIONS}
            selectedValues={draft.colors}
            onToggle={(value) => toggleArrayValue("colors", value)}
          />
          <MultiSelectGroup
            label="Styles"
            options={PRODUCT_STYLE_OPTIONS}
            selectedValues={draft.styles}
            onToggle={(value) => toggleArrayValue("styles", value)}
          />
          <MultiSelectGroup
            label="Tags"
            options={PRODUCT_TAG_OPTIONS}
            selectedValues={draft.tags}
            onToggle={(value) => toggleArrayValue("tags", value)}
          />
        </div>

        <div className="space-y-2 text-sm text-[var(--color-dark)] md:col-span-2">
          <textarea
            value={draft.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            placeholder={draft.locale === "es" ? "Descripción corta" : "Short description"}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-2 text-sm text-[var(--color-dark)] md:col-span-2">
          <textarea
            value={draft.longDescription}
            onChange={(event) => updateField("longDescription", event.target.value)}
            rows={4}
            placeholder={draft.locale === "es" ? "Descripción larga" : "Long description"}
            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Las opciones compartidas del producto se moverán a un módulo independiente de configuración. Aquí no se editan por producto.
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-[var(--color-dark)]">
          <input type="checkbox" checked={draft.active} onChange={(event) => updateField("active", event.target.checked)} className="h-4 w-4 rounded border-rose-200 text-rose-700 focus:ring-rose-200" />
          Active product
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--color-dark)]">
          <input type="checkbox" checked={draft.bestSeller} onChange={(event) => updateField("bestSeller", event.target.checked)} className="h-4 w-4 rounded border-rose-200 text-rose-700 focus:ring-rose-200" />
          Best seller
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={() => void onSubmit()} disabled={busy} className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
