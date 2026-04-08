"use client";

import { useState } from "react";

export type AutoBuyFrequency = "weekly" | "monthly" | "quarterly" | "annually";
export type AutoBuyType = "notification" | "autoorder";

export interface AutoBuyConfig {
  enabled: boolean;
  frequency: AutoBuyFrequency;
  startDate: string;
  endDate: string;
  quantity: number;
  type: AutoBuyType;
}

interface AutoBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AutoBuyConfig) => void;
  ui: {
    autoBuyModalTitle: string;
    autoBuyModalDescription: string;
    autoBuyFrequencyLabel: string;
    autoBuyFrequencyWeekly: string;
    autoBuyFrequencyBiweekly: string;
    autoBuyFrequencyMonthly: string;
    autoBuyCancelButton: string;
    autoBuyConfirmButton: string;
  };
}

export function AutoBuyModal({
  isOpen,
  onClose,
  onSave,
  ui,
}: AutoBuyModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0];
  
  const [frequency, setFrequency] = useState<AutoBuyFrequency>("monthly");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(oneYearLater);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<AutoBuyType>("autoorder");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ 
      enabled: true, 
      frequency,
      startDate,
      endDate,
      quantity,
      type
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
            {ui.autoBuyModalTitle}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {ui.autoBuyModalDescription}
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-semibold text-[var(--color-dark)] mb-2"
              >
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-semibold text-[var(--color-dark)] mb-2"
              >
                Fecha de Finalización
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-[var(--color-dark)] mb-2"
            >
              Cantidad por Entrega
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="frequency"
              className="block text-sm font-semibold text-[var(--color-dark)] mb-2"
            >
              {ui.autoBuyFrequencyLabel}
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as AutoBuyFrequency)}
              className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="weekly">{ui.autoBuyFrequencyWeekly}</option>
              <option value="monthly">{ui.autoBuyFrequencyMonthly}</option>
              <option value="quarterly">Cada 3 Meses</option>
              <option value="annually">Una Vez al Año</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-dark)] mb-3">
              Tipo de Suscripción
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-primary-light)]/70 cursor-pointer transition-all hover:bg-[var(--color-primary-pale)]/20 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-pale)]/30">
                <input
                  type="radio"
                  name="autobuy-type"
                  value="autoorder"
                  checked={type === "autoorder"}
                  onChange={(e) => setType(e.target.value as AutoBuyType)}
                  className="mt-0.5 h-4 w-4 rounded-full border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="flex-1">
                  <span className="block text-sm font-semibold text-[var(--color-dark)]">
                    Auto-Comprar
                  </span>
                  <span className="block text-xs text-[var(--color-muted)] mt-0.5">
                    Se procesará automáticamente el pedido según la frecuencia
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-primary-light)]/70 cursor-pointer transition-all hover:bg-[var(--color-primary-pale)]/20 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-pale)]/30">
                <input
                  type="radio"
                  name="autobuy-type"
                  value="notification"
                  checked={type === "notification"}
                  onChange={(e) => setType(e.target.value as AutoBuyType)}
                  className="mt-0.5 h-4 w-4 rounded-full border-[var(--color-primary-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="flex-1">
                  <span className="block text-sm font-semibold text-[var(--color-dark)]">
                    Recordatorio
                  </span>
                  <span className="block text-xs text-[var(--color-muted)] mt-0.5">
                    Recibirás una notificación para confirmar tu pedido
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-primary-pale)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--color-primary-light)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-pale)] transition-all"
          >
            {ui.autoBuyCancelButton}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-95"
          >
            {ui.autoBuyConfirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
