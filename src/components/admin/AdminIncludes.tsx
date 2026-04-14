"use client";

import { useMemo, useState } from "react";

import { PRODUCT_CATEGORY_OPTIONS } from "./product-option-sets";

type Locale = "en" | "es";

type IncludeCategory = {
  id: string;
  key: string;
  labelEs: string;
  labelEn: string;
  descriptionEs: string | null;
  descriptionEn: string | null;
  productCategories: string;
  inputType: string;
  required: boolean;
  active: boolean;
  sortOrder: number;
  items: IncludeItem[];
};

type IncludeItem = {
  id: string;
  categoryId: string;
  key: string;
  nameEs: string;
  nameEn: string;
  priceDeltaUsd: number;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
};

type IncludeConfiguration = {
  id: string;
  key: string;
  labelEs: string;
  labelEn: string;
  descriptionEs: string | null;
  descriptionEn: string | null;
  productCategories: string;
  active: boolean;
  sortOrder: number;
  items: Array<{ includeItemId: string }>;
};

type CategoryForm = {
  key: string;
  label: string;
  description: string;
  productCategories: string[];
  inputType: string;
  required: boolean;
  active: boolean;
  sortOrder: number;
};

type ItemForm = {
  categoryId: string;
  key: string;
  name: string;
  priceDeltaUsd: number;
  imagePath: string;
  active: boolean;
  sortOrder: number;
};

type ConfigurationForm = {
  key: string;
  label: string;
  description: string;
  productCategories: string[];
  active: boolean;
  sortOrder: number;
  includeItemIds: string[];
};

function parseTargets(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [] as string[];
  }
}

function categoryToForm(locale: Locale, category?: IncludeCategory): CategoryForm {
  return {
    key: category?.key ?? "",
    label: locale === "es" ? category?.labelEs ?? "" : category?.labelEn ?? "",
    description: locale === "es" ? category?.descriptionEs ?? "" : category?.descriptionEn ?? "",
    productCategories: category ? parseTargets(category.productCategories) : [],
    inputType: category?.inputType ?? "single",
    required: category?.required ?? false,
    active: category?.active ?? true,
    sortOrder: category?.sortOrder ?? 0,
  };
}

function itemToForm(item: IncludeItem, locale: Locale): ItemForm {
  return {
    categoryId: item.categoryId,
    key: item.key,
    name: locale === "es" ? item.nameEs : item.nameEn,
    priceDeltaUsd: item.priceDeltaUsd,
    imagePath: item.imagePath ?? "/uploads/products/product-placeholder.svg",
    active: item.active,
    sortOrder: item.sortOrder,
  };
}

function configurationToForm(locale: Locale, configuration?: IncludeConfiguration): ConfigurationForm {
  return {
    key: configuration?.key ?? "",
    label: locale === "es" ? configuration?.labelEs ?? "" : configuration?.labelEn ?? "",
    description: locale === "es" ? configuration?.descriptionEs ?? "" : configuration?.descriptionEn ?? "",
    productCategories: configuration ? parseTargets(configuration.productCategories) : [],
    active: configuration?.active ?? true,
    sortOrder: configuration?.sortOrder ?? 0,
    includeItemIds: configuration?.items.map((item) => item.includeItemId) ?? [],
  };
}

function SelectionChips({
  values,
  selected,
  onToggle,
}: {
  values: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-full px-3 py-2 text-xs transition ${active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type DeleteTarget = {
  entity: "category" | "item" | "configuration";
  id: string;
  url: string;
  title: string;
  description: string;
  errorMessage: string;
};

const placeholderImagePath = "/uploads/products/product-placeholder.svg";

function createEmptyItemForm(categoryId: string): ItemForm {
  return {
    categoryId,
    key: "",
    name: "",
    priceDeltaUsd: 0,
    imagePath: placeholderImagePath,
    active: true,
    sortOrder: 0,
  };
}

function sortItems(items: IncludeItem[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn));
}

function sortCategories(items: IncludeCategory[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.labelEn.localeCompare(b.labelEn));
}

function sortConfigurations(items: IncludeConfiguration[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.labelEn.localeCompare(b.labelEn));
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</div>;
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-950">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminIncludes({
  initialSnapshot,
  locale,
}: {
  initialSnapshot: {
    categories: IncludeCategory[];
    configurations: IncludeConfiguration[];
  };
  locale: Locale;
}) {
  const [categories, setCategories] = useState(initialSnapshot.categories);
  const [configurations, setConfigurations] = useState(initialSnapshot.configurations);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryForm>(categoryToForm(locale));
  const [itemForm, setItemForm] = useState<ItemForm>(createEmptyItemForm(initialSnapshot.categories[0]?.id ?? ""));
  const [configurationForm, setConfigurationForm] = useState<ConfigurationForm>(configurationToForm(locale));

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isConfigurationModalOpen, setIsConfigurationModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const allItems = useMemo(() => sortItems(categories.flatMap((category) => category.items)), [categories]);
  const categoryOptions = PRODUCT_CATEGORY_OPTIONS;

  const itemLookup = useMemo(() => new Map(allItems.map((item) => [item.id, item])), [allItems]);

  const toggleInArray = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const resetCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm(categoryToForm(locale));
    setIsCategoryModalOpen(false);
  };

  const resetItemModal = () => {
    setEditingItemId(null);
    setItemForm(createEmptyItemForm(categories[0]?.id ?? ""));
    setIsItemModalOpen(false);
  };

  const resetConfigurationModal = () => {
    setEditingConfigurationId(null);
    setConfigurationForm(configurationToForm(locale));
    setIsConfigurationModalOpen(false);
  };

  const openCreateCategoryModal = () => {
    setStatusMessage(null);
    setEditingCategoryId(null);
    setCategoryForm(categoryToForm(locale));
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: IncludeCategory) => {
    setStatusMessage(null);
    setEditingCategoryId(category.id);
    setCategoryForm(categoryToForm(locale, category));
    setIsCategoryModalOpen(true);
  };

  const openCreateItemModal = (categoryId: string) => {
    setStatusMessage(null);
    setEditingItemId(null);
    setItemForm(createEmptyItemForm(categoryId));
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: IncludeItem) => {
    setStatusMessage(null);
    setEditingItemId(item.id);
    setItemForm(itemToForm(item, locale));
    setIsItemModalOpen(true);
  };

  const openCreateConfigurationModal = () => {
    setStatusMessage(null);
    setEditingConfigurationId(null);
    setConfigurationForm(configurationToForm(locale));
    setIsConfigurationModalOpen(true);
  };

  const openEditConfigurationModal = (configuration: IncludeConfiguration) => {
    setStatusMessage(null);
    setEditingConfigurationId(configuration.id);
    setConfigurationForm(configurationToForm(locale, configuration));
    setIsConfigurationModalOpen(true);
  };

  const openDeleteModal = (target: DeleteTarget) => {
    setStatusMessage(null);
    setDeleteTarget(target);
  };

  const uploadImage = async (file: File) => {
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

  const saveCategory = async () => {
    setIsSaving(true);
    try {
      const method = editingCategoryId ? "PUT" : "POST";
      const url = editingCategoryId ? `/api/admin/includes/categories/${editingCategoryId}` : "/api/admin/includes/categories";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoryForm, locale }),
      });

      if (!response.ok) {
        setStatusMessage(locale === "es" ? "No se pudo guardar la categoría." : "Could not save category.");
        return;
      }

      const payload = (await response.json()) as { success: true; data: Omit<IncludeCategory, "items"> };
      const savedCategory = payload.data;

      setCategories((current) => {
        const previous = current.find((category) => category.id === savedCategory.id);
        const nextCategory: IncludeCategory = {
          ...savedCategory,
          items: previous?.items ?? [],
        };

        const withoutCurrent = current.filter((category) => category.id !== savedCategory.id);
        if (!savedCategory.active) {
          return sortCategories(withoutCurrent);
        }

        return sortCategories([...withoutCurrent, nextCategory]);
      });

      setStatusMessage(locale === "es" ? "Categoría guardada." : "Category saved.");
      resetCategoryModal();
    } finally {
      setIsSaving(false);
    }
  };

  const saveItem = async () => {
    setIsSaving(true);
    try {
      const method = editingItemId ? "PUT" : "POST";
      const url = editingItemId ? `/api/admin/includes/items/${editingItemId}` : "/api/admin/includes/items";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...itemForm, locale }),
      });

      if (!response.ok) {
        setStatusMessage(locale === "es" ? "No se pudo guardar el subproducto." : "Could not save subproduct.");
        return;
      }

      const payload = (await response.json()) as { success: true; data: IncludeItem };
      const savedItem = payload.data;

      setCategories((current) => {
        const next = current.map((category) => ({
          ...category,
          items: category.items.filter((item) => item.id !== savedItem.id),
        }));

        if (!savedItem.active) {
          return next.map((category) => ({ ...category, items: sortItems(category.items) }));
        }

        return next.map((category) => {
          if (category.id !== savedItem.categoryId) {
            return { ...category, items: sortItems(category.items) };
          }

          return {
            ...category,
            items: sortItems([...category.items, savedItem]),
          };
        });
      });

      setConfigurations((current) =>
        current.map((configuration) => ({
          ...configuration,
          items: configuration.items.filter((item) => item.includeItemId !== savedItem.id || savedItem.active),
        })),
      );

      setStatusMessage(locale === "es" ? "Subproducto guardado." : "Subproduct saved.");
      resetItemModal();
    } finally {
      setIsSaving(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const method = editingConfigurationId ? "PUT" : "POST";
      const url = editingConfigurationId
        ? `/api/admin/includes/configurations/${editingConfigurationId}`
        : "/api/admin/includes/configurations";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...configurationForm, locale }),
      });

      if (!response.ok) {
        setStatusMessage(locale === "es" ? "No se pudo guardar la configuración." : "Could not save configuration.");
        return;
      }

      const payload = (await response.json()) as { success: true; data: IncludeConfiguration };
      const savedConfiguration = payload.data;

      setConfigurations((current) => {
        const withoutCurrent = current.filter((configuration) => configuration.id !== savedConfiguration.id);
        if (!savedConfiguration.active) {
          return sortConfigurations(withoutCurrent);
        }

        return sortConfigurations([...withoutCurrent, savedConfiguration]);
      });

      setStatusMessage(locale === "es" ? "Configuración guardada." : "Configuration saved.");
      resetConfigurationModal();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntity = async (url: string, message: string) => {
    if (!deleteTarget) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(url, { method: "DELETE" });

      if (!response.ok) {
        setStatusMessage(message);
        return;
      }

      if (deleteTarget.entity === "category") {
        const deletedCategory = categories.find((category) => category.id === deleteTarget.id);
        const deletedItemIds = new Set(deletedCategory?.items.map((item) => item.id) ?? []);

        setCategories((current) => current.filter((category) => category.id !== deleteTarget.id));
        if (deletedItemIds.size > 0) {
          setConfigurations((current) =>
            current.map((configuration) => ({
              ...configuration,
              items: configuration.items.filter((item) => !deletedItemIds.has(item.includeItemId)),
            })),
          );
        }
      }

      if (deleteTarget.entity === "item") {
        setCategories((current) =>
          current.map((category) => ({
            ...category,
            items: category.items.filter((item) => item.id !== deleteTarget.id),
          })),
        );
        setConfigurations((current) =>
          current.map((configuration) => ({
            ...configuration,
            items: configuration.items.filter((item) => item.includeItemId !== deleteTarget.id),
          })),
        );
      }

      if (deleteTarget.entity === "configuration") {
        setConfigurations((current) => current.filter((configuration) => configuration.id !== deleteTarget.id));
      }

      setDeleteTarget(null);
      setStatusMessage(locale === "es" ? "Elemento eliminado." : "Entity deleted.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {statusMessage ? <p className="text-sm font-medium text-rose-600">{statusMessage}</p> : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "es" ? "Includes / Subproductos" : "Includes / Subproducts"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {locale === "es"
                ? "Administra categorías compartidas, subproductos y configuraciones como Standard, Premium, Deluxe o Luxury desde flujos CRUD inline con modales."
                : "Manage shared categories, subproducts, and configurations such as Standard, Premium, Deluxe, or Luxury through inline CRUD flows with modals."}
            </p>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {locale === "es" ? "Categorías y subproductos" : "Categories & Subproducts"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "es"
                      ? "Edita categorías y subproductos sin salir del listado."
                      : "Edit categories and subproducts without leaving the list."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateCategoryModal}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  {locale === "es" ? "+ Agregar categoría" : "+ Add Category"}
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {categories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    {locale === "es" ? "No hay categorías activas." : "No active categories yet."}
                  </div>
                ) : null}

                {categories.map((category) => (
                  <div key={category.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-950">
                            {locale === "es" ? category.labelEs : category.labelEn}
                          </p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {category.key}
                          </span>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {category.inputType}
                          </span>
                          {category.required ? (
                            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {locale === "es" ? "Requerido" : "Required"}
                            </span>
                          ) : null}
                        </div>
                        {(locale === "es" ? category.descriptionEs : category.descriptionEn) ? (
                          <p className="text-sm text-slate-600">{locale === "es" ? category.descriptionEs : category.descriptionEn}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          {(parseTargets(category.productCategories).length > 0
                            ? parseTargets(category.productCategories)
                            : [locale === "es" ? "Todas" : "All"]
                          ).map((target) => (
                            <span
                              key={`${category.id}-${target}`}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                            >
                              {target}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <button type="button" onClick={() => openEditCategoryModal(category)} className="text-slate-700 hover:text-slate-950">
                          {locale === "es" ? "Editar" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              entity: "category",
                              id: category.id,
                              url: `/api/admin/includes/categories/${category.id}`,
                              title: locale === "es" ? "Eliminar categoría" : "Delete category",
                              description:
                                locale === "es"
                                  ? "Esta acción eliminará la categoría y sus subproductos asociados."
                                  : "This will delete the category and its related subproducts.",
                              errorMessage:
                                locale === "es" ? "No se pudo eliminar la categoría." : "Could not delete category.",
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          {locale === "es" ? "Eliminar" : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {category.items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                          {locale === "es" ? "Sin subproductos en esta categoría." : "No subproducts in this category yet."}
                        </div>
                      ) : null}

                      {category.items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={item.imagePath || placeholderImagePath}
                              alt={locale === "es" ? item.nameEs : item.nameEn}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{locale === "es" ? item.nameEs : item.nameEn}</p>
                              <p className="text-xs text-slate-500">
                                {item.key} · US${item.priceDeltaUsd.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 text-sm">
                            <button type="button" onClick={() => openEditItemModal(item)} className="text-slate-700 hover:text-slate-950">
                              {locale === "es" ? "Editar" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal({
                                  entity: "item",
                                  id: item.id,
                                  url: `/api/admin/includes/items/${item.id}`,
                                  title: locale === "es" ? "Eliminar subproducto" : "Delete subproduct",
                                  description:
                                    locale === "es"
                                      ? "Esta acción eliminará el subproducto de las categorías y configuraciones activas."
                                      : "This will remove the subproduct from active categories and configurations.",
                                  errorMessage:
                                    locale === "es" ? "No se pudo eliminar el subproducto." : "Could not delete subproduct.",
                                })
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              {locale === "es" ? "Eliminar" : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => openCreateItemModal(category.id)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                      >
                        {locale === "es" ? "+ Agregar subproducto" : "+ Add subproduct"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {locale === "es" ? "Configuraciones activas" : "Active Configurations"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {locale === "es"
                      ? "Administra presets de includes y sus subproductos incluidos."
                      : "Manage include presets and their included subproducts."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateConfigurationModal}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  {locale === "es" ? "+ Agregar configuración" : "+ Add Configuration"}
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {configurations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    {locale === "es" ? "No hay configuraciones activas." : "No active configurations yet."}
                  </div>
                ) : null}

                {configurations.map((configuration) => (
                  <div key={configuration.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-950">
                            {locale === "es" ? configuration.labelEs : configuration.labelEn}
                          </p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {configuration.key}
                          </span>
                        </div>
                        {(locale === "es" ? configuration.descriptionEs : configuration.descriptionEn) ? (
                          <p className="text-sm text-slate-600">
                            {locale === "es" ? configuration.descriptionEs : configuration.descriptionEn}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          {(parseTargets(configuration.productCategories).length > 0
                            ? parseTargets(configuration.productCategories)
                            : [locale === "es" ? "Todas" : "All"]
                          ).map((target) => (
                            <span
                              key={`${configuration.id}-${target}`}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                            >
                              {target}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => openEditConfigurationModal(configuration)}
                          className="text-slate-700 hover:text-slate-950"
                        >
                          {locale === "es" ? "Editar" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              entity: "configuration",
                              id: configuration.id,
                              url: `/api/admin/includes/configurations/${configuration.id}`,
                              title: locale === "es" ? "Eliminar configuración" : "Delete configuration",
                              description:
                                locale === "es"
                                  ? "Esta acción eliminará la configuración activa."
                                  : "This will delete the active configuration.",
                              errorMessage:
                                locale === "es"
                                  ? "No se pudo eliminar la configuración."
                                  : "Could not delete configuration.",
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          {locale === "es" ? "Eliminar" : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {configuration.items.length === 0 ? (
                        <span className="text-sm text-slate-500">
                          {locale === "es" ? "Sin subproductos incluidos." : "No included subproducts yet."}
                        </span>
                      ) : null}

                      {configuration.items.map((configurationItem) => {
                        const includeItem = itemLookup.get(configurationItem.includeItemId);
                        if (!includeItem) {
                          return null;
                        }

                        return (
                          <span
                            key={configurationItem.includeItemId}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                          >
                            {locale === "es" ? includeItem.nameEs : includeItem.nameEn}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </main>

      {isCategoryModalOpen ? (
        <ModalShell
          title={editingCategoryId ? (locale === "es" ? "Editar categoría" : "Edit category") : locale === "es" ? "Agregar categoría" : "Add category"}
          description={locale === "es" ? "Los cambios se aplican solo al idioma actual." : "Changes apply only to the current locale."}
          onClose={resetCategoryModal}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveCategory();
            }}
          >
            <div className="space-y-2">
              <FieldLabel>key</FieldLabel>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={categoryForm.key} onChange={(event) => setCategoryForm((state) => ({ ...state, key: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Nombre" : "Label"}</FieldLabel>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={categoryForm.label} onChange={(event) => setCategoryForm((state) => ({ ...state, label: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Descripción" : "Description"}</FieldLabel>
              <textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={categoryForm.description} onChange={(event) => setCategoryForm((state) => ({ ...state, description: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Categorías de producto" : "Product categories"}</FieldLabel>
              <SelectionChips values={categoryOptions} selected={categoryForm.productCategories} onToggle={(value) => setCategoryForm((state) => ({ ...state, productCategories: toggleInArray(state.productCategories, value) }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>{locale === "es" ? "Tipo de input" : "Input type"}</FieldLabel>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={categoryForm.inputType} onChange={(event) => setCategoryForm((state) => ({ ...state, inputType: event.target.value }))}>
                  <option value="single">Single</option>
                  <option value="multi">Multi</option>
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel>{locale === "es" ? "Orden" : "Sort order"}</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm((state) => ({ ...state, sortOrder: Number(event.target.value) }))} />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={categoryForm.required} onChange={(event) => setCategoryForm((state) => ({ ...state, required: event.target.checked }))} />
                {locale === "es" ? "Requerido" : "Required"}
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={categoryForm.active} onChange={(event) => setCategoryForm((state) => ({ ...state, active: event.target.checked }))} />
                {locale === "es" ? "Activo" : "Active"}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetCategoryModal} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                {locale === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button type="submit" disabled={isSaving} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {editingCategoryId ? (locale === "es" ? "Guardar cambios" : "Save changes") : locale === "es" ? "Crear categoría" : "Create category"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {isItemModalOpen ? (
        <ModalShell
          title={editingItemId ? (locale === "es" ? "Editar subproducto" : "Edit subproduct") : locale === "es" ? "Agregar subproducto" : "Add subproduct"}
          description={locale === "es" ? "Sube una imagen o pega la ruta manualmente." : "Upload an image or paste the path manually."}
          onClose={resetItemModal}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveItem();
            }}
          >
            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Categoría" : "Category"}</FieldLabel>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={itemForm.categoryId} onChange={(event) => setItemForm((state) => ({ ...state, categoryId: event.target.value }))}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {locale === "es" ? category.labelEs : category.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>key</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={itemForm.key} onChange={(event) => setItemForm((state) => ({ ...state, key: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <FieldLabel>{locale === "es" ? "Precio extra" : "Price delta"}</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" step="0.01" value={itemForm.priceDeltaUsd} onChange={(event) => setItemForm((state) => ({ ...state, priceDeltaUsd: Number(event.target.value) }))} />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Nombre" : "Name"}</FieldLabel>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={itemForm.name} onChange={(event) => setItemForm((state) => ({ ...state, name: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Imagen" : "Image"}</FieldLabel>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={itemForm.imagePath || placeholderImagePath} alt="Preview" className="h-40 w-full object-cover" />
              </div>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={itemForm.imagePath} onChange={(event) => setItemForm((state) => ({ ...state, imagePath: event.target.value }))} />
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  setIsUploadingImage(true);
                  void uploadImage(file)
                    .then((path) => {
                      setItemForm((state) => ({ ...state, imagePath: path }));
                      setStatusMessage(locale === "es" ? "Imagen cargada." : "Image uploaded.");
                    })
                    .catch(() => {
                      setStatusMessage(locale === "es" ? "No se pudo subir la imagen." : "Could not upload image.");
                    })
                    .finally(() => {
                      setIsUploadingImage(false);
                    });
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>{locale === "es" ? "Orden" : "Sort order"}</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" value={itemForm.sortOrder} onChange={(event) => setItemForm((state) => ({ ...state, sortOrder: Number(event.target.value) }))} />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={itemForm.active} onChange={(event) => setItemForm((state) => ({ ...state, active: event.target.checked }))} />
                  {locale === "es" ? "Activo" : "Active"}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetItemModal} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                {locale === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button type="submit" disabled={isSaving || isUploadingImage} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {editingItemId ? (locale === "es" ? "Guardar cambios" : "Save changes") : locale === "es" ? "Crear subproducto" : "Create subproduct"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {isConfigurationModalOpen ? (
        <ModalShell
          title={editingConfigurationId ? (locale === "es" ? "Editar configuración" : "Edit configuration") : locale === "es" ? "Agregar configuración" : "Add configuration"}
          description={locale === "es" ? "Selecciona las categorías de producto y los subproductos incluidos." : "Choose product categories and included subproducts."}
          onClose={resetConfigurationModal}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveConfiguration();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>key</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={configurationForm.key} onChange={(event) => setConfigurationForm((state) => ({ ...state, key: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <FieldLabel>{locale === "es" ? "Orden" : "Sort order"}</FieldLabel>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" value={configurationForm.sortOrder} onChange={(event) => setConfigurationForm((state) => ({ ...state, sortOrder: Number(event.target.value) }))} />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Nombre" : "Label"}</FieldLabel>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={configurationForm.label} onChange={(event) => setConfigurationForm((state) => ({ ...state, label: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Descripción" : "Description"}</FieldLabel>
              <textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={configurationForm.description} onChange={(event) => setConfigurationForm((state) => ({ ...state, description: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{locale === "es" ? "Categorías de producto" : "Product categories"}</FieldLabel>
              <SelectionChips values={categoryOptions} selected={configurationForm.productCategories} onToggle={(value) => setConfigurationForm((state) => ({ ...state, productCategories: toggleInArray(state.productCategories, value) }))} />
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <FieldLabel>{locale === "es" ? "Subproductos incluidos" : "Included subproducts"}</FieldLabel>
              <SelectionChips values={allItems.map((item) => ({ value: item.id, label: locale === "es" ? item.nameEs : item.nameEn }))} selected={configurationForm.includeItemIds} onToggle={(value) => setConfigurationForm((state) => ({ ...state, includeItemIds: toggleInArray(state.includeItemIds, value) }))} />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={configurationForm.active} onChange={(event) => setConfigurationForm((state) => ({ ...state, active: event.target.checked }))} />
              {locale === "es" ? "Activo" : "Active"}
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetConfigurationModal} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                {locale === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button type="submit" disabled={isSaving} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {editingConfigurationId ? (locale === "es" ? "Guardar cambios" : "Save changes") : locale === "es" ? "Crear configuración" : "Create configuration"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {deleteTarget ? (
        <ModalShell title={deleteTarget.title} description={deleteTarget.description} onClose={() => setDeleteTarget(null)}>
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              {locale === "es" ? "Esta acción no se puede deshacer." : "This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                {locale === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button type="button" disabled={isSaving} onClick={() => void deleteEntity(deleteTarget.url, deleteTarget.errorMessage)} className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {locale === "es" ? "Confirmar eliminación" : "Confirm delete"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
