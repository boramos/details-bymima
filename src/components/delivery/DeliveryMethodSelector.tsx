"use client";

import type { CheckoutDeliveryMethod } from "@/lib/checkout";
import type { LandingDictionary } from "@/lib/i18n";

type DeliveryMethodSelectorProps = {
  deliveryMethod: CheckoutDeliveryMethod;
  onDeliveryMethodChange: (method: CheckoutDeliveryMethod) => void;
  hasPassport: boolean;
  isAuthenticated: boolean;
  sameDayAvailable: boolean;
  ui: {
    deliveryMethodLabel: string;
    deliveryMethodPickup: string;
    deliveryMethodStandard: string;
    deliveryMethodTomorrow: string;
    deliveryMethodToday: string;
    deliveryPriceFree: string;
    deliveryPriceMemberDiscount: string;
  };
};

export function DeliveryMethodSelector({
  deliveryMethod,
  onDeliveryMethodChange,
  hasPassport,
  isAuthenticated,
  sameDayAvailable,
  ui,
}: DeliveryMethodSelectorProps) {
  return (
    <div className="rounded-xl border border-[var(--color-primary-light)]/70 bg-white p-4">
      <label htmlFor="delivery-method" className="block text-sm font-semibold text-[var(--color-dark)] mb-2">
        {ui.deliveryMethodLabel}
      </label>
      <select
        id="delivery-method"
        value={deliveryMethod}
        onChange={(e) => onDeliveryMethodChange(e.target.value as CheckoutDeliveryMethod)}
        className="w-full rounded-lg border border-[var(--color-primary-light)]/70 px-4 py-2.5 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
      >
        <option value="pickup">{ui.deliveryMethodPickup} - {ui.deliveryPriceFree}</option>
        <option value="standard">
          {ui.deliveryMethodStandard} - {hasPassport ? ui.deliveryPriceFree : (isAuthenticated ? `${ui.deliveryPriceMemberDiscount} (+$3)` : "+$4")}
        </option>
        <option value="tomorrow">
          {ui.deliveryMethodTomorrow} - {hasPassport ? ui.deliveryPriceFree : (isAuthenticated ? `${ui.deliveryPriceMemberDiscount} (+$5)` : "+$7")}
        </option>
        {sameDayAvailable && (
          <option value="today">
            {ui.deliveryMethodToday} - {hasPassport ? ui.deliveryPriceFree : (isAuthenticated ? `${ui.deliveryPriceMemberDiscount} (+$7)` : "+$10")}
          </option>
        )}
      </select>
    </div>
  );
}
