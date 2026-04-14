import { prisma } from "@/lib/prisma";

export type ConfigKey = 
  | "passport_price_usd"
  | "free_delivery_threshold_usd"
  | "delivery_standard_usd"
  | "delivery_tomorrow_usd"
  | "delivery_today_usd"
  | "delivery_pickup_usd"
  | "tax_rate"
  | "sandbox_mode"
  | "sms_2fa_enabled"
  | "sms_sandbox_mode"
  | "twilio_account_sid"
  | "twilio_auth_token"
  | "twilio_phone_number";

type ConfigValue = string | number | boolean | object;

export class ConfigService {
  private static cache = new Map<string, { value: ConfigValue; timestamp: number }>();
  private static CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  /**
   * Get a configuration value by key
   */
  static async get(key: ConfigKey): Promise<ConfigValue | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    const config = await prisma.siteConfig.findUnique({
      where: { key },
    });

    if (!config) {
      return null;
    }

    const value = this.parseValue(config.value, config.valueType);
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }

  /**
   * Get multiple configuration values at once
   */
  static async getMany(keys: ConfigKey[]): Promise<Record<string, ConfigValue | null>> {
    const result: Record<string, ConfigValue | null> = {};

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  }

  /**
   * Get a configuration value with fallback default
   */
  static async getOrDefault<T extends ConfigValue>(key: ConfigKey, defaultValue: T): Promise<T> {
    const value = await this.get(key);
    return (value !== null ? value : defaultValue) as T;
  }

  /**
   * Set a configuration value
   */
  static async set(key: ConfigKey, value: ConfigValue, description?: string, category?: string): Promise<void> {
    const valueType = this.getValueType(value);
    const stringValue = this.stringifyValue(value, valueType);

    await prisma.siteConfig.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        valueType,
        description,
        category,
      },
      update: {
        value: stringValue,
        valueType,
        description,
        category,
      },
    });

    // Update cache
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Delete a configuration
   */
  static async delete(key: ConfigKey): Promise<void> {
    await prisma.siteConfig.delete({
      where: { key },
    });

    this.cache.delete(key);
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  static async listAll() {
    const configs = await prisma.siteConfig.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return configs.map((config) => ({
      ...config,
      parsedValue: this.parseValue(config.value, config.valueType),
    }));
  }

  /**
   * Initialize default configurations if they don't exist
   */
  static async initializeDefaults(): Promise<void> {
    const defaults: Array<{ key: ConfigKey; value: ConfigValue; description: string; category: string }> = [
      {
        key: "passport_price_usd",
        value: 19.99,
        description: "Passport subscription annual price in USD",
        category: "pricing",
      },
      {
        key: "free_delivery_threshold_usd",
        value: 100,
        description: "Minimum order amount for free delivery in USD",
        category: "delivery",
      },
      {
        key: "delivery_standard_usd",
        value: 4,
        description: "Standard delivery price in USD (3-5 days)",
        category: "delivery",
      },
      {
        key: "delivery_tomorrow_usd",
        value: 7,
        description: "Next day delivery price in USD",
        category: "delivery",
      },
      {
        key: "delivery_today_usd",
        value: 10,
        description: "Same day delivery price in USD (before 2pm)",
        category: "delivery",
      },
      {
        key: "delivery_pickup_usd",
        value: 0,
        description: "Pickup price in USD (always free)",
        category: "delivery",
      },
      {
        key: "tax_rate",
        value: 0.07,
        description: "Sales tax rate (7%)",
        category: "tax",
      },
      {
        key: "sandbox_mode",
        value: true,
        description: "Modo de prueba: salta Stripe/PayPal y simula compras exitosas",
        category: "dev",
      },
      {
        key: "sms_2fa_enabled",
        value: false,
        description: "Activa o desactiva la verificación de 2 pasos vía SMS para todos los usuarios",
        category: "sms",
      },
      {
        key: "sms_sandbox_mode",
        value: true,
        description: "No envía SMS real. El código aparece en pantalla para probar el flujo sin Twilio.",
        category: "sms",
      },
      {
        key: "twilio_account_sid",
        value: "",
        description: "Account SID de Twilio — encuéntralo en twilio.com/console",
        category: "sms",
      },
      {
        key: "twilio_auth_token",
        value: "",
        description: "Auth Token de Twilio — encuéntralo en twilio.com/console (sensible)",
        category: "sms",
      },
      {
        key: "twilio_phone_number",
        value: "",
        description: "Número de teléfono remitente de Twilio, ej: +15005550006",
        category: "sms",
      },
    ];

    for (const config of defaults) {
      const exists = await prisma.siteConfig.findUnique({
        where: { key: config.key },
      });

      if (!exists) {
        await this.set(config.key, config.value, config.description, config.category);
      }
    }
  }

  private static parseValue(value: string, valueType: string): ConfigValue {
    switch (valueType) {
      case "number":
        return parseFloat(value);
      case "boolean":
        return value === "true";
      case "json":
        return JSON.parse(value) as object;
      default:
        return value;
    }
  }

  private static stringifyValue(value: ConfigValue, valueType: string): string {
    switch (valueType) {
      case "json":
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  private static getValueType(value: ConfigValue): string {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "object") return "json";
    return "string";
  }
}
