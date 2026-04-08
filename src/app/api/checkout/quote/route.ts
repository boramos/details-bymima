import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { buildCheckoutQuote, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { PassportService } from "@/services/PassportService";

type QuoteRequestBody = {
  locale?: Locale;
  items?: CheckoutDraftItem[];
  deliveryMethod?: CheckoutDeliveryMethod;
  hasPassport?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequestBody;
    const session = await auth();

    const hasActivePassport = session?.user?.id
      ? await PassportService.isPassportActive(session.user.id)
      : false;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const quote = await buildCheckoutQuote({
      locale: body.locale ?? DEFAULT_LOCALE,
      items: body.items,
      deliveryMethod: body.deliveryMethod ?? "standard",
      includePassport: body.hasPassport ?? false,
      hasActivePassport,
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
