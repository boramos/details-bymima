"use client";

import { useState } from "react";
import { AdminProduct, Locale, ProductDraft, productToDraft } from "./admin-types";
import { ProductEditor } from "./ProductEditor";

export function AdminProducts({ initialProducts, locale }: { initialProducts: AdminProduct[]; locale: Locale }) {
  const [products, setProducts] = useState(initialProducts);
  const [productMode, setProductMode] = useState<"create" | "edit" | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(productToDraft(locale));
  const [productBusy, setProductBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const openCreateProduct = () => {
    setProductMode("create");
    setEditingProductId(null);
    setProductDraft(productToDraft(locale));
  };

  const openEditProduct = (product: AdminProduct) => {
    setProductMode("edit");
    setEditingProductId(product.id);
    setProductDraft(productToDraft(locale, product));
  };

  const saveProduct = async () => {
    setStatusMessage(null);

    const slug = productDraft.slug.trim();
    const name = productDraft.name.trim();
    const price = Number(productDraft.basePriceCop);

    if (!slug || slug.length < 2) {
      setStatusMessage("Slug must be at least 2 characters.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setStatusMessage("Slug may only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    if (!name || name.length < 2) {
      setStatusMessage("Name must be at least 2 characters.");
      return;
    }
    if (!productDraft.basePriceCop || isNaN(price) || price < 1) {
      setStatusMessage("Base price must be a positive number.");
      return;
    }

    setProductBusy(true);

    try {
      const normalizedImagePaths = (productDraft.imagePaths ?? [])
        .map((path) => path.trim())
        .filter(Boolean);

      const payload = {
        ...productDraft,
        basePriceCop: Number(productDraft.basePriceCop),
        imagePaths: normalizedImagePaths,
        imagePath: normalizedImagePaths[0] ?? "",
      };

      const response = await fetch(productMode === "create" ? "/api/admin/products" : `/api/admin/products/${editingProductId}`, {
        method: productMode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to save product");

      const data = (await response.json()) as { data: AdminProduct };

      if (productMode === "create") {
        setProducts((current) => [data.data, ...current]);
      } else {
        setProducts((current) => current.map((product) => (product.id === data.data.id ? data.data : product)));
      }

      setProductMode(null);
      setEditingProductId(null);
        setStatusMessage("Product saved and translated");
    } catch {
      setStatusMessage("Unable to save product");
    } finally {
      setProductBusy(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setStatusMessage(null);
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (response.ok) {
      setProducts((current) => current.filter((product) => product.id !== id));
      setStatusMessage("Product archived");
    } else {
      setStatusMessage("Unable to archive product");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {statusMessage && <p className="text-sm font-medium text-rose-600">{statusMessage}</p>}
        
        <div id="products" className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Gestión de productos</h2>
            <p className="mt-1 text-sm text-slate-600">Agrega, edita, archiva y decide qué producto aparece como best seller. El otro idioma se traduce automáticamente.</p>
          </div>
          <button type="button" onClick={openCreateProduct} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Nuevo producto</button>
        </div>

        {productMode && (
          <ProductEditor
            draft={productDraft}
            onChange={setProductDraft}
            onCancel={() => setProductMode(null)}
            onSubmit={saveProduct}
            busy={productBusy}
            mode={productMode}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {products.map((product) => (
                  <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                          <img src={product.imagePath || "/uploads/products/product-placeholder.svg"} alt={locale === "es" ? product.nameEs : product.nameEn} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{locale === "es" ? product.nameEs : product.nameEn}</h3>
                    <p className="text-sm text-slate-500">{locale === "es" ? product.descriptionEs : product.descriptionEn}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{product.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <span className={`rounded-full px-2.5 py-1 ${product.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{product.active ? "Active" : "Hidden"}</span>
                  {product.bestSeller && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Best seller</span>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-slate-950">${product.basePriceCop.toFixed(2)}</span>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEditProduct(product)} className="text-slate-700 transition hover:text-slate-950">Editar</button>
                  <button type="button" onClick={() => void deleteProduct(product.id)} className="text-red-600 transition hover:text-red-800">Archivar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
