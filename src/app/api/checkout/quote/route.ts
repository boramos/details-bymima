import { NextResponse } from "next/server";

import { buildCheckoutQuote, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

type QuoteRequestBody = {
  locale?: Locale;
  items?: CheckoutDraftItem[];
  deliveryMethod?: CheckoutDeliveryMethod;
  hasPassport?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequestBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const quote = await buildCheckoutQuote({
      locale: body.locale ?? DEFAULT_LOCALE,
      items: body.items,
      deliveryMethod: body.deliveryMethod ?? "standard",
    });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate quote" },
      { status: 400 },
    );
  }
}
