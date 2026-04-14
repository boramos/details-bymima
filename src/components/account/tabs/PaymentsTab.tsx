"use client";

import { useState, useEffect, useCallback } from "react";
import SecurityEditModal from "@/components/account/SecurityEditModal";

type Card = {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  nickname: string | null;
  cardCvc: string | null;
};

type AddCardFormData = {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardCvc: string;
  isDefault: boolean;
};

type EditCardFormData = {
  nickname: string;
  isDefault: boolean;
};

function detectBrand(number: string): string {
  const c = number.replace(/\D/g, "");
  if (/^4/.test(c)) return "visa";
  if (/^5[1-5]/.test(c) || /^2[2-7]\d{2}/.test(c)) return "mastercard";
  if (/^3[47]/.test(c)) return "amex";
  if (/^6(?:011|22\d|4[4-9]|5)/.test(c)) return "discover";
  return "unknown";
}

function formatDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  return clean.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function emptyAddForm(): AddCardFormData {
  return { cardName: "", cardNumber: "", expiryMonth: "", expiryYear: "", cardCvc: "", isDefault: false };
}

function getYears(): string[] {
  const y = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => String(y + i));
}

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];

function CardVisualBadge({ brand }: { brand: string }) {
  if (brand === "visa") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black italic tracking-tight bg-[#1a1f71] text-white select-none">
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span role="img" aria-label="Mastercard" className="inline-flex items-center select-none">
        <span className="inline-block h-5 w-5 rounded-full bg-[#eb001b] opacity-90" />
        <span className="inline-block h-5 w-5 -ml-3 rounded-full bg-[#f79e1b] opacity-90" />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black tracking-tight bg-[#007bc1] text-white select-none">
        AMEX
      </span>
    );
  }
  if (brand === "discover") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black tracking-tight bg-[#f76f20] text-white select-none">
        DISC
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black tracking-tight bg-gray-400 text-white select-none">
      CARD
    </span>
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

export default function PaymentsTab({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const [cards, setCards] = useState<Card[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [addForm, setAddForm] = useState<AddCardFormData>(emptyAddForm());
  const [editForm, setEditForm] = useState<EditCardFormData>({ nickname: "", isDefault: false });
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";
  const selectClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary-pale)] text-[var(--color-dark)] bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]";

  const loadCards = useCallback(async () => {
    try {
      const res = await fetch("/api/user/cards");
      if (res.ok) {
        const json = await res.json() as { success: boolean; data: Card[] };
        setCards(json.data ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  function openAdd() {
    setAddForm(emptyAddForm());
    setAddOpen(true);
  }

  function openEdit(card: Card) {
    setEditForm({ nickname: card.nickname ?? "", isDefault: card.isDefault });
    setEditingCard(card);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const clean = addForm.cardNumber.replace(/\D/g, "");
      const brand = detectBrand(clean);
      if (brand === "unknown" || clean.length < 13) {
        throw new Error(isEs ? "Número de tarjeta inválido" : "Invalid card number");
      }
      if (!addForm.expiryMonth || !addForm.expiryYear) {
        throw new Error(isEs ? "Selecciona la fecha de vencimiento" : "Select expiry date");
      }
      const cvcMax = brand === "amex" ? 4 : 3;
      if (!addForm.cardName || addForm.cardName.trim().length < 2) {
        throw new Error(isEs ? "Ingresa el nombre del titular" : "Enter the cardholder name");
      }
      if (!addForm.cardCvc || addForm.cardCvc.length < cvcMax) {
        throw new Error(isEs ? `CVV debe tener ${cvcMax} dígitos` : `CVV must be ${cvcMax} digits`);
      }
      const last4 = clean.slice(-4);
      const res = await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          last4,
          brand,
          expiryMonth: addForm.expiryMonth,
          expiryYear: addForm.expiryYear,
          cardCvc: addForm.cardCvc,
          nickname: addForm.cardName.trim() || null,
          isDefault: addForm.isDefault,
        }),
      });
      if (!res.ok) throw new Error();
      setMsg(isEs ? "Tarjeta agregada" : "Card added");
      setAddOpen(false);
      await loadCards();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : (isEs ? "Error al agregar tarjeta" : "Error adding card"));
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCard) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/user/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: editForm.nickname || null, isDefault: editForm.isDefault }),
      });
      if (!res.ok) throw new Error();
      setMsg(isEs ? "Tarjeta actualizada" : "Card updated");
      setEditingCard(null);
      await loadCards();
    } catch {
      setMsg(isEs ? "Error al actualizar" : "Error updating card");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isEs ? "¿Seguro que deseas eliminar?" : "Are you sure?")) return;
    try {
      const res = await fetch(`/api/user/cards/${id}`, { method: "DELETE" });
      if (res.ok) await loadCards();
    } catch {}
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/user/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) await loadCards();
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
        {isEs ? "Tus Pagos" : "Your Payments"}
      </h2>

      {msg && (
        <p className="text-sm font-medium text-[var(--color-primary)]">{msg}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.length < 5 && (
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
              {isEs ? "Agregar tarjeta" : "Add card"}
            </span>
          </button>
        )}

        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-[var(--color-primary-pale)] bg-white overflow-hidden flex flex-col">
            {card.isDefault && (
              <div className="px-5 pt-4 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {isEs ? "Predeterminada" : "Default"}
                </span>
                <div className="mt-3 border-t border-[var(--color-primary-pale)]" />
              </div>
            )}
            <div className={`px-5 flex-1 ${card.isDefault ? "pt-3" : "pt-5"}`}>
              <div className="flex items-center gap-3 mb-3">
                <CardVisualBadge brand={card.brand} />
                <span className="font-bold text-[var(--color-dark)] font-mono">•••• {card.last4}</span>
              </div>
              {card.nickname && (
                <p className="text-sm font-medium text-[var(--color-dark)] mb-1">{card.nickname}</p>
              )}
              <p className="text-sm text-gray-600">
                {isEs ? "Vence" : "Exp"}: {card.expiryMonth}/{card.expiryYear.slice(-2)}
              </p>
            </div>
            <div className="px-5 py-4 mt-3 border-t border-[var(--color-primary-pale)] flex items-center flex-wrap gap-y-1">
              <button type="button" onClick={() => openEdit(card)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                {isEs ? "Editar" : "Edit"}
              </button>
              <span className="mx-2 text-[var(--color-primary-pale)] select-none">|</span>
              <button type="button" onClick={() => void handleDelete(card.id)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                {isEs ? "Eliminar" : "Remove"}
              </button>
              {!card.isDefault && (
                <>
                  <span className="mx-2 text-[var(--color-primary-pale)] select-none">|</span>
                  <button type="button" onClick={() => void handleSetDefault(card.id)} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                    {isEs ? "Establecer como predeterminada" : "Set as default"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-sm text-[var(--color-muted)] text-center py-4">
          {isEs ? "No tienes tarjetas guardadas." : "No saved cards."}
        </p>
      )}

      <SecurityEditModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={isEs ? "Agregar tarjeta" : "Add card"}
      >
        <form onSubmit={(e) => { void handleAdd(e); }} className="space-y-4">
          <div>
            <input
              id="pt-cardName"
              type="text"
              autoComplete="cc-name"
              value={addForm.cardName}
              onChange={(e) => setAddForm((p) => ({ ...p, cardName: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'.-]/g, "") }))}
              placeholder={isEs ? "Nombre del titular" : "Cardholder name"}
              className={inputClass}
              required
            />
          </div>
          <div>
            <div className="relative">
              <input
                id="pt-cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={formatDisplay(addForm.cardNumber)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setAddForm((p) => ({ ...p, cardNumber: raw }));
                }}
                placeholder={isEs ? "Número de tarjeta" : "Card number"}
                className={inputClass + " pr-20"}
                required
              />
              {addForm.cardNumber.length > 0 && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <CardVisualBadge brand={detectBrand(addForm.cardNumber)} />
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="relative">
                <select
                  id="pt-expMonth"
                  value={addForm.expiryMonth}
                  onChange={(e) => setAddForm((p) => ({ ...p, expiryMonth: e.target.value }))}
                  className={selectClass}
                  required
                >
                  <option value="">{isEs ? "Mes" : "Month"}</option>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronIcon />
              </div>
            </div>
            <div>
              <div className="relative">
                <select
                  id="pt-expYear"
                  value={addForm.expiryYear}
                  onChange={(e) => setAddForm((p) => ({ ...p, expiryYear: e.target.value }))}
                  className={selectClass}
                  required
                >
                  <option value="">{isEs ? "Año" : "Year"}</option>
                  {getYears().map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronIcon />
              </div>
            </div>
            <div>
              <input
                id="pt-cvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={addForm.cardCvc}
                onChange={(e) => {
                  const max = detectBrand(addForm.cardNumber) === "amex" ? 4 : 3;
                  setAddForm((p) => ({ ...p, cardCvc: e.target.value.replace(/\D/g, "").slice(0, max) }));
                }}
                placeholder="CVV"
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="pt-isDefault"
              type="checkbox"
              checked={addForm.isDefault}
              onChange={(e) => setAddForm((p) => ({ ...p, isDefault: e.target.checked }))}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <label htmlFor="pt-isDefault" className="text-sm font-medium text-[var(--color-dark)]">
              {isEs ? "Tarjeta predeterminada" : "Set as default"}
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={addLoading}
              className="flex-1 py-2.5 bg-[var(--color-dark)] text-white text-sm font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-50"
            >
              {addLoading ? "..." : (isEs ? "Guardar" : "Save")}
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 py-2.5 border border-[var(--color-primary-pale)] text-[var(--color-dark)] text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              {isEs ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      </SecurityEditModal>

      <SecurityEditModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        title={isEs ? "Editar tarjeta" : "Edit card"}
      >
        {editingCard && (
          <form onSubmit={(e) => { void handleEdit(e); }} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-primary-pale)]">
              <CardVisualBadge brand={editingCard.brand} />
              <span className="font-mono font-bold text-[var(--color-dark)]">•••• {editingCard.last4}</span>
              <span className="text-xs text-[var(--color-muted)] ml-auto">
                {editingCard.expiryMonth}/{editingCard.expiryYear.slice(-2)}
              </span>
            </div>
            <div>
              <input
                id="pt-edit-nickname"
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm((p) => ({ ...p, nickname: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'.-]/g, "") }))}
                placeholder={isEs ? "Nombre del titular" : "Cardholder name"}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="pt-edit-isDefault"
                type="checkbox"
                checked={editForm.isDefault}
                onChange={(e) => setEditForm((p) => ({ ...p, isDefault: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <label htmlFor="pt-edit-isDefault" className="text-sm font-medium text-[var(--color-dark)]">
                {isEs ? "Tarjeta predeterminada" : "Set as default"}
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={editLoading}
                className="flex-1 py-2.5 bg-[var(--color-dark)] text-white text-sm font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-50"
              >
                {editLoading ? "..." : (isEs ? "Guardar" : "Save")}
              </button>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="flex-1 py-2.5 border border-[var(--color-primary-pale)] text-[var(--color-dark)] text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                {isEs ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </form>
        )}
      </SecurityEditModal>
    </div>
  );
}
