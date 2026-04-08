"use client";

import { useMemo, useState } from "react";

import {
  filterGroups,
  getFilterOptionLabel,
  type CatalogProduct,
  type FilterKey,
} from "@/lib/catalog";
import type { LandingDictionary, Locale } from "@/lib/i18n";

import ProductCard from "@/components/catalog/ProductCard";

type CatalogExperienceProps = {
  products: CatalogProduct[];
  locale: Locale;
  ui: LandingDictionary["catalogUi"];
};

type FiltersState = Record<FilterKey, string[]>;

const initialFilters: FiltersState = {
  category: [],
  color: [],
  style: [],
};

export default function CatalogExperience({ products, locale, ui }: CatalogExperienceProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  const availableOptions = useMemo(() => {
    return {
      category: new Set(products.flatMap((product) => product.categories)),
      color: new Set(products.flatMap((product) => product.colors)),
      style: new Set(products.flatMap((product) => product.styles)),
    };
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name[locale].toLowerCase().includes(normalizedSearch) ||
        product.description[locale].toLowerCase().includes(normalizedSearch);

      const matchesCategories =
        filters.category.length === 0 ||
        filters.category.some((selected) => product.categories.includes(selected));

      const matchesColors =
        filters.color.length === 0 ||
        filters.color.some((selected) => product.colors.includes(selected));

      const matchesStyles =
        filters.style.length === 0 ||
        filters.style.some((selected) => product.styles.includes(selected));

      return matchesSearch && matchesCategories && matchesColors && matchesStyles;
    });
  }, [filters, locale, products, search]);

  const activeFilterCount = filters.category.length + filters.color.length + filters.style.length;

  const toggleFilter = (group: FilterKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [group]: current[group].includes(value)
        ? current[group].filter((entry) => entry !== value)
        : [...current[group], value],
    }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[2rem] border border-[var(--color-primary-light)] bg-white/90 p-6 shadow-sm lg:sticky lg:top-28">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-[var(--color-dark)]">{ui.filtersTitle}</h2>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilters(initialFilters);
                }}
                className="text-sm font-medium text-[var(--color-primary)] transition-opacity hover:opacity-80"
              >
                {ui.clearFiltersLabel}
              </button>
            </div>

            <label className="block">
              <span className="sr-only">{ui.searchPlaceholder}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ui.searchPlaceholder}
                className="w-full rounded-2xl border border-[var(--color-primary-light)] bg-[var(--color-cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </label>

            <div className="rounded-2xl bg-[var(--color-primary-pale)] px-4 py-3 text-sm text-[var(--color-muted)]">
              {ui.resultsLabel.replace("{count}", String(visibleProducts.length)).replace("{filters}", String(activeFilterCount))}
            </div>
          </div>

          {filterGroups.map((group) => {
            const options = group.options.filter((option) => availableOptions[group.key].has(option.key));
            if (options.length === 0) {
              return null;
            }

            return (
              <section key={group.key} className="space-y-3 border-t border-[var(--color-primary-pale)] pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {group.label[locale]}
                </h3>

                <div className="space-y-2">
                  {options.map((option) => {
                    const checked = filters[group.key].includes(option.key);
                    return (
                      <label key={option.key} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--color-primary-pale)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFilter(group.key, option.key)}
                          className="h-4 w-4 rounded border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm text-[var(--color-dark)]">
                          {getFilterOptionLabel(group.key, option.key, locale)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </aside>

      <div className="space-y-6">
        {visibleProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--color-primary-light)] bg-white px-8 py-14 text-center shadow-sm">
            <p className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
              {ui.emptyStateTitle}
            </p>
            <p className="mt-3 text-[var(--color-muted)]">{ui.emptyStateBody}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} ui={ui} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
