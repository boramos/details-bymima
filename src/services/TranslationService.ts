import type { Locale } from "@/lib/i18n";

const OPENAI_TRANSLATION_MODEL = process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini";

function isLikelyUrl(value: string) {
  return /^\/?[\w\-/%.]+(\.[a-z]{2,5})?$/.test(value) || /^https?:\/\//.test(value);
}

async function translateText(text: string, sourceLocale: Locale, targetLocale: Locale) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !text.trim() || isLikelyUrl(text)) {
    return text;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_TRANSLATION_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a professional ecommerce translator. Translate the user's text faithfully for a floral gifting website. Keep structure, tone, and line breaks. Return only the translated text.",
        },
        {
          role: "user",
          content: `Translate this text from ${sourceLocale} to ${targetLocale}:\n\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return text;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || text;
}

export class TranslationService {
  static async translateValue<T>(value: T, sourceLocale: Locale, targetLocale: Locale): Promise<T> {
    if (typeof value === "string") {
      return (await translateText(value, sourceLocale, targetLocale)) as T;
    }

    if (Array.isArray(value)) {
      return (await Promise.all(value.map((item) => this.translateValue(item, sourceLocale, targetLocale)))) as T;
    }

    if (value && typeof value === "object") {
      const entries = await Promise.all(
        Object.entries(value).map(async ([key, childValue]) => {
          const translatedChild = await this.translateValue(childValue, sourceLocale, targetLocale);
          return [key, translatedChild] as const;
        }),
      );

      return Object.fromEntries(entries) as T;
    }

    return value;
  }
}
