"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPriceCop } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

type WishlistItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  addedAt: string;
  product: {
    nameEs: string;
    imagePath: string | null;
    imageEmoji: string | null;
    gradientClass: string | null;
    basePriceCop: number;
  };
};

type Wishlist = {
  id: string;
  name: string;
  isDefault: boolean;
  items: WishlistItem[];
};

export default function WishlistTab({ locale }: { locale: Locale }) {
  const isEs = locale === "es";
  const [lists, setLists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = useCallback(async () => {
    try {
      const res = await fetch("/api/user/wishlists");
      if (res.ok) {
        const json = await res.json() as { success: boolean; data: Wishlist[] };
        setLists(json.data ?? []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  async function handleDeleteList(id: string) {
    if (!confirm(isEs ? "¿Seguro?" : "Are you sure?")) return;
    try {
      const res = await fetch(`/api/user/wishlists/${id}`, { method: "DELETE" });
      if (res.ok) await loadLists();
    } catch {}
  }

  async function handleRemoveItem(itemId: string) {
    try {
      const res = await fetch(`/api/user/wishlists/items/${itemId}`, { method: "DELETE" });
      if (res.ok) await loadLists();
    } catch {}
  }

  if (loading) return <p className="text-[var(--color-muted)]">{isEs ? "Cargando..." : "Loading..."}</p>;

  if (lists.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--color-cream)] border border-[var(--color-primary-pale)]">
        <p className="text-[var(--color-dark)] mb-4">{isEs ? "No tienes listas guardadas. Explora el catálogo para guardar productos." : "No wishlists found. Explore the catalog to save products."}</p>
        <Link href="/order" className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-light)] transition-colors">
          {isEs ? "Ver catálogo" : "View catalog"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
        {isEs ? "Tus Listas" : "Your Wishlists"}
      </h2>

      <div className="space-y-8">
        {lists.map(list => (
          <div key={list.id} className="bg-white p-6 border border-[var(--color-primary-pale)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-primary-pale)]">
              <div>
                <h3 className="font-bold text-[var(--color-dark)] text-lg flex items-center gap-2">
                  {list.name}
                  {list.isDefault && <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--color-primary-pale)] text-[var(--color-primary)]">Predeterminada</span>}
                </h3>
              </div>
              {!list.isDefault && (
                <button type="button" onClick={() => void handleDeleteList(list.id)} className="text-sm text-red-600 font-semibold hover:underline">
                  {isEs ? "Eliminar lista" : "Delete list"}
                </button>
              )}
            </div>

            {list.items.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">{isEs ? "Lista vacía." : "Empty list."}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {list.items.map(item => (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      aria-label={isEs ? "Eliminar de la lista" : "Remove from list"}
                      onClick={() => void handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 flex items-center justify-center text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <Link href={`/product/${item.productSlug}`} className="block aspect-square relative bg-[var(--color-cream)] overflow-hidden">
                      {item.product.imagePath ? (
                        <Image src={item.product.imagePath} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-4xl ${item.product.gradientClass ?? "bg-gradient-to-br from-pink-100 to-rose-100"}`}>
                          {item.product.imageEmoji ?? "🌸"}
                        </div>
                      )}
                    </Link>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-[var(--color-dark)] line-clamp-1">{isEs ? item.product.nameEs : item.productName}</p>
                      <p className="text-sm font-semibold text-[var(--color-primary)] mt-0.5">{formatPriceCop(item.product.basePriceCop, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
