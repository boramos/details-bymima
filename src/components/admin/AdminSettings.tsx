"use client";

import { useState } from "react";
import { AdminConfig } from "./admin-types";
import { DynamicJsonForm } from "./DynamicJsonForm";

function parseConfigInput(value: string, valueType: string) {
  if (valueType === "number") return Number(value);
  if (valueType === "boolean") return value === "true";
  if (valueType === "json") return JSON.parse(value) as object;
  return value;
}

const configLabels: Record<string, { title: string; description: string }> = {
  passport_price_usd: { title: "Precio de Passport", description: "Costo anual del Passport." },
  free_delivery_threshold_usd: { title: "Monto mínimo para delivery gratis", description: "Compra mínima para activar delivery gratis sin Passport." },
  delivery_standard_usd: { title: "Delivery estándar", description: "Costo del envío estándar." },
  delivery_tomorrow_usd: { title: "Delivery next day", description: "Costo del envío para mañana." },
  delivery_today_usd: { title: "Same-day delivery", description: "Costo del envío el mismo día antes del cutoff." },
  delivery_pickup_usd: { title: "Pickup en tienda", description: "Costo para recoger en tienda." },
  tax_rate: { title: "Impuesto", description: "Porcentaje de impuesto aplicado al checkout." },
  sandbox_mode: { title: "Modo Sandbox (Prueba)", description: "Actívalo para simular compras sin procesar pagos reales. Desactívalo cuando Stripe/PayPal estén configurados." },
  sms_2fa_enabled: { title: "Habilitar 2FA por SMS", description: "Activa o desactiva la verificación de 2 pasos vía SMS para todos los usuarios." },
  sms_sandbox_mode: { title: "Modo Sandbox SMS", description: "No envía SMS real. El código aparece en pantalla para probar el flujo completo sin Twilio." },
  twilio_account_sid: { title: "Twilio Account SID", description: "Encuéntralo en twilio.com/console bajo \"Account Info\"." },
  twilio_auth_token: { title: "Twilio Auth Token", description: "Token de autenticación de Twilio. Mantenlo confidencial." },
  twilio_phone_number: { title: "Número remitente Twilio", description: "Número de teléfono desde el que se envían los SMS, ej: +15005550006." },
};

const SMS_KEYS = new Set(["sms_2fa_enabled", "sms_sandbox_mode", "twilio_account_sid", "twilio_auth_token", "twilio_phone_number"]);
const SENSITIVE_KEYS = new Set(["twilio_auth_token"]);

function ConfigCard({ config, onSaved }: { config: AdminConfig; onSaved: (value: string | number | boolean | object) => void }) {
  const [value, setValue] = useState(() => (config.valueType === "json" ? config.value : String(config.parsedValue)));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const parsedValue = parseConfigInput(value, config.valueType);
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: config.key, value: parsedValue, description: config.description, category: config.category }),
      });

      if (!response.ok) throw new Error("Unable to save configuration");

      onSaved(parsedValue);
      setMessage("Saved");
    } catch {
      setMessage("Invalid value");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-slate-900">{configLabels[config.key]?.title ?? config.key}</h3>
          <p className="mt-1 text-xs text-slate-500">{configLabels[config.key]?.description ?? config.description ?? "No description"}</p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600">{config.category}</span>
      </div>

      {config.valueType === "boolean" ? (
        <select
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          <option value="true">Activado</option>
          <option value="false">Desactivado</option>
        </select>
      ) : config.valueType === "json" ? (
        <div className="rounded-xl border border-rose-100 bg-white p-3">
          <DynamicJsonForm initialJson={value} onChange={setValue} />
        </div>
      ) : (
        <input
          type={SENSITIVE_KEYS.has(config.key) ? "password" : config.valueType === "number" ? "number" : "text"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete={SENSITIVE_KEYS.has(config.key) ? "off" : undefined}
          placeholder={configLabels[config.key]?.title ?? config.key}
          className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">{message}</span>
        <button type="button" onClick={() => void save()} disabled={busy} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60">
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </article>
  );
}

export function AdminSettings({ initialConfigs }: { initialConfigs: AdminConfig[] }) {
  const [configs, setConfigs] = useState(initialConfigs);

  const siteConfigs = configs.filter((c) => !SMS_KEYS.has(c.key));
  const smsConfigs = configs.filter((c) => SMS_KEYS.has(c.key));

  const handleSaved = (id: string) => (parsedValue: string | number | boolean | object) => {
    setConfigs((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, parsedValue, value: typeof parsedValue === "string" ? parsedValue : JSON.stringify(parsedValue) }
          : item,
      ),
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div id="settings" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Configuración del sitio</h2>
          <p className="mt-1 text-sm text-slate-600">Aquí controlas delivery, impuestos, Passport y parámetros operativos.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siteConfigs.map((config) => (
            <ConfigCard key={config.id} config={config} onSaved={handleSaved(config.id)} />
          ))}
        </div>

        {smsConfigs.length > 0 && (
          <>
            <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📱</span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">SMS & Verificación de 2 pasos</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Configura las credenciales de Twilio para habilitar el envío de códigos OTP por SMS.
                    Crea una cuenta gratuita en{" "}
                    <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline hover:text-violet-800">
                      twilio.com/console
                    </a>{" "}
                    y copia el Account SID, Auth Token y el número de teléfono asignado.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {smsConfigs.map((config) => (
                <ConfigCard key={config.id} config={config} onSaved={handleSaved(config.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
