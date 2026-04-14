"use client";

import type { CheckoutDeliveryMethod } from "@/lib/checkout";

type AddressFormProps = {
  deliveryMethod: CheckoutDeliveryMethod;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  onFieldChange: (field: string, value: string) => void;
  ui: {
    customerTitle: string;
    emailLabel: string;
    nameLabel: string;
    phoneLabel: string;
    addressLabel: string;
    cityLabel: string;
    postalCodeLabel: string;
  };
};

export function AddressForm({
  deliveryMethod,
  email,
  name,
  phone,
  address,
  city,
  postalCode,
  onFieldChange,
  ui,
}: AddressFormProps) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/92 p-6 shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
      <h2 className="text-xl font-semibold text-[var(--color-dark)]">{ui.customerTitle}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          type="email"
          value={email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder={ui.emailLabel}
          required
          className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder={ui.nameLabel}
          required
          minLength={2}
          className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => onFieldChange("phone", e.target.value.replace(/[^\d\s+\-()\u00f3]/g, ""))}
          placeholder={ui.phoneLabel}
          required
          className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
        />
        {deliveryMethod !== "pickup" && (
          <>
            <input
              type="text"
              value={address}
              onChange={(e) => onFieldChange("address", e.target.value)}
              placeholder={ui.addressLabel}
              required
              minLength={5}
              className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => onFieldChange("city", e.target.value)}
              placeholder={ui.cityLabel}
              required
              minLength={2}
              className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
            />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => onFieldChange("postalCode", e.target.value.replace(/[^\d\s-]/g, "").slice(0, 10))}
              placeholder={ui.postalCodeLabel}
              required
              className="rounded-xl border border-[var(--color-primary-light)]/70 px-4 py-3"
            />
          </>
        )}
      </div>
    </section>
  );
}
