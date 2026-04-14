"use client";

import { useState } from "react";
import SecurityEditModal from "@/components/account/SecurityEditModal";

const COUNTRIES: { value: string; label: string }[] = [
  { value: "United States", label: "United States" },
];

const STATES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  "United States": [
    { value: "Florida", label: "Florida" },
  ],
};

type Address = {
  id: string;
  label: string | null;
  firstName: string | null;
  lastName: string | null;
  street: string;
  apartment: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
};

type AddressFormData = {
  street: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  deliveryInstructions: string;
  isDefault: boolean;
};

type AddressesTabProps = {
  initialAddresses: Address[];
  locale: string;
  userName: string;
};

const defaultCountry = COUNTRIES[0].value;
const defaultState = (STATES_BY_COUNTRY[defaultCountry] ?? [])[0]?.value ?? "";

function emptyForm(): AddressFormData {
  return {
    street: "",
    apartment: "",
    city: "",
    state: defaultState,
    postalCode: "",
    country: defaultCountry,
    phone: "",
    deliveryInstructions: "",
    isDefault: false,
  };
}

export default function AddressesTab({ initialAddresses, locale, userName }: AddressesTabProps) {
  const isEs = locale === "es";
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [addOpen, setAddOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addForm, setAddForm] = useState<AddressFormData>(emptyForm());
  const [editForm, setEditForm] = useState<AddressFormData>(emptyForm());
  const [msg, setMsg] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const addStates = STATES_BY_COUNTRY[addForm.country] ?? [];
  const editStates = STATES_BY_COUNTRY[editForm.country] ?? [];

  async function loadAddresses() {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch {}
  }

  function openAdd() {
    setAddForm(emptyForm());
    setAddOpen(true);
  }

  function openEdit(addr: Address) {
    setEditForm({
      street: addr.street,
      apartment: addr.apartment ?? "",
      city: addr.city,
      state: addr.state ?? defaultState,
      postalCode: addr.postalCode,
      country: addr.country || defaultCountry,
      phone: addr.phone ?? "",
      deliveryInstructions: addr.deliveryInstructions ?? "",
      isDefault: addr.isDefault,
    });
    setEditingAddr(addr);
  }

  function handleAddCountry(country: string) {
    const states = STATES_BY_COUNTRY[country] ?? [];
    setAddForm((p) => ({ ...p, country, state: states[0]?.value ?? "" }));
  }

  function handleEditCountry(country: string) {
    const states = STATES_BY_COUNTRY[country] ?? [];
    setEditForm((p) => ({ ...p, country, state: states[0]?.value ?? "" }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error();
      setMsg(isEs ? "Dirección agregada" : "Address added");
      setAddOpen(false);
      await loadAddresses();
    } catch {
      setMsg(isEs ? "Error al agregar dirección" : "Error adding address");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAddr) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/addresses/${editingAddr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setMsg(isEs ? "Dirección actualizada" : "Address updated");
      setEditingAddr(null);
      await loadAddresses();
    } catch {
      setMsg(isEs ? "Error al actualizar" : "Error updating address");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isEs ? "¿Seguro que deseas eliminar?" : "Are you sure?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) await loadAddresses();
    } catch {}
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "PUT" });
      if (res.ok) await loadAddresses();
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
        {isEs ? "Tus Direcciones" : "Your Addresses"}
      </h2>

      {msg && (
        <p className="text-sm font-medium text-[var(--color-primary)]">{msg}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length < 5 && (
          <button
            type="button"
            onClick={openAdd}
            className="flex flex-col items-center justify-center gap-3 min-h-[160px] rounded-2xl border-2 border-dashed border-[var(--color-primary-pale)] bg-white hover:bg-[var(--color-cream)] hover:border-[var(--color-primary)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--color-primary-pale)] group-hover:border-[var(--color-primary)] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
              {isEs ? "Agregar dirección" : "Add address"}
            </span>
          </button>
        )}

        {addresses.map((addr) => (
          <div key={addr.id} className="rounded-2xl border border-[var(--color-primary-pale)] bg-white overflow-hidden flex flex-col">
            {addr.isDefault && (
              <div className="px-5 pt-4 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {isEs ? "Predeterminada" : "Default"}
                </span>
                <div className="mt-3 border-t border-[var(--color-primary-pale)]" />
              </div>
            )}
            <div className={`px-5 flex-1 ${addr.isDefault ? "pt-3" : "pt-5"}`}>
              <p className="font-bold text-[var(--color-dark)] mb-1">{userName}</p>
              <p className="text-sm text-gray-600">
                {addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}
              </p>
              <p className="text-sm text-gray-600">
                {addr.city}{addr.state ? `, ${addr.state}` : ""}, {addr.postalCode}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>
              {addr.phone && (
                <p className="text-sm text-gray-600 mt-0.5">
                  <span className="font-medium text-[var(--color-dark)]">{isEs ? "Teléfono:" : "Phone:"}</span>{" "}
                  {addr.phone}
                </p>
              )}
              {addr.deliveryInstructions && (
                <p className="text-sm text-gray-500 mt-1 italic">{addr.deliveryInstructions}</p>
              )}
            </div>
            <div className="px-5 py-4 mt-3 border-t border-[var(--color-primary-pale)] flex items-center flex-wrap gap-y-1">
              <button type="button" onClick={() => openEdit(addr)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                {isEs ? "Editar" : "Edit"}
              </button>
              <span className="mx-2 text-[var(--color-primary-pale)] select-none">|</span>
              <button type="button" onClick={() => handleDelete(addr.id)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                {isEs ? "Eliminar" : "Remove"}
              </button>
              {!addr.isDefault && (
                <>
                  <span className="mx-2 text-[var(--color-primary-pale)] select-none">|</span>
                  <button type="button" onClick={() => handleSetDefault(addr.id)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                    {isEs ? "Establecer como predeterminada" : "Set as default"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <p className="text-sm text-[var(--color-muted)] text-center py-4">
          {isEs ? "No tienes direcciones guardadas." : "No saved addresses."}
        </p>
      )}

      <SecurityEditModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={isEs ? "Agregar dirección" : "Add address"}
      >
        <AddressForm
          form={addForm}
          setForm={setAddForm}
          states={addStates}
          onCountryChange={handleAddCountry}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={addLoading}
          isEs={isEs}
          showDefault
        />
      </SecurityEditModal>

      <SecurityEditModal
        isOpen={!!editingAddr}
        onClose={() => setEditingAddr(null)}
        title={isEs ? "Editar dirección" : "Edit address"}
      >
        <AddressForm
          form={editForm}
          setForm={setEditForm}
          states={editStates}
          onCountryChange={handleEditCountry}
          onSubmit={handleEdit}
          onCancel={() => setEditingAddr(null)}
          loading={editLoading}
          isEs={isEs}
          showDefault={false}
        />
      </SecurityEditModal>
    </div>
  );
}

type AddressFormProps = {
  form: AddressFormData;
  setForm: React.Dispatch<React.SetStateAction<AddressFormData>>;
  states: { value: string; label: string }[];
  onCountryChange: (country: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEs: boolean;
  showDefault: boolean;
};

function AddressForm({ form, setForm, states, onCountryChange, onSubmit, onCancel, loading, isEs, showDefault }: AddressFormProps) {
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
  const selectClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input id="af-street" type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder={isEs ? "Dirección" : "Street address"} className={inputClass} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input id="af-apt" type="text" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} placeholder={isEs ? "Apt/Suite" : "Apt/Suite"} className={inputClass} />
        </div>
        <div>
          <input id="af-city" type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={isEs ? "Ciudad" : "City"} className={inputClass} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="relative">
            <select id="af-country" value={form.country} onChange={(e) => onCountryChange(e.target.value)} className={selectClass}>
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
        <div>
          <div className="relative">
            <select id="af-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={selectClass} disabled={states.length === 0}>
              {states.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input id="af-zip" type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/[^\d\s-]/g, "").slice(0, 10) })} placeholder={isEs ? "Código Postal" : "ZIP Code"} className={inputClass} required />
        </div>
        <div>
          <input id="af-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d\s+\-()]/g, "") })} placeholder={isEs ? "Teléfono" : "Phone"} className={inputClass} />
        </div>
      </div>
      <div>
        <textarea id="af-instr" rows={2} value={form.deliveryInstructions} onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })} placeholder={isEs ? "Instrucciones de entrega" : "Delivery instructions"} className={inputClass} />
      </div>
      {showDefault && (
        <div className="flex items-center gap-2">
          <input id="af-default" type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary)]" />
          <label htmlFor="af-default" className="text-sm font-medium text-[var(--color-dark)]">
            {isEs ? "Dirección predeterminada" : "Set as default"}
          </label>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[var(--color-dark)] text-white text-sm font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-50">
          {loading ? "..." : (isEs ? "Guardar" : "Save")}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-[var(--color-primary-pale)] text-[var(--color-dark)] text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors">
          {isEs ? "Cancelar" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
