import { NextResponse } from "next/server";

import { buildCheckoutQuote, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

type StripeCheckoutBody = {
  locale?: Locale;
  items?: CheckoutDraftItem[];
  deliveryMethod?: CheckoutDeliveryMethod;
  customer?: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
};

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeKey || !siteUrl) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as StripeCheckoutBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const quote = await buildCheckoutQuote({
      locale: body.locale ?? DEFAULT_LOCALE,
      items: body.items,
      deliveryMethod: body.deliveryMethod ?? "standard",
    });

    const payload = new URLSearchParams();
    payload.set("mode", "payment");
    payload.set("success_url", `${siteUrl}/checkout/success?provider=stripe`);
    payload.set("cancel_url", `${siteUrl}/checkout?cancelled=1`);
    payload.set("customer_email", body.customer?.email ?? "");
    payload.set("line_items[0][price_data][currency]", "usd");
    payload.set("line_items[0][price_data][unit_amount]", String(Math.round(quote.total * 100)));
    payload.set("line_items[0][price_data][product_data][name]", "Details by MIMA order");
    payload.set("line_items[0][quantity]", "1");
    payload.set("metadata[customer_name]", body.customer?.name ?? "");
    payload.set("metadata[phone]", body.customer?.phone ?? "");
    payload.set("metadata[address]", body.customer?.address ?? "");
    payload.set("metadata[city]", body.customer?.city ?? "");
    payload.set("metadata[postal_code]", body.customer?.postalCode ?? "");
    payload.set("metadata[delivery_method]", quote.deliveryMethod);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    const data = (await response.json()) as { url?: string; error?: { message?: string } };

    if (!response.ok || !data.url) {
      return NextResponse.json({ error: data.error?.message ?? "Could not create Stripe checkout." }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Stripe checkout failed" }, { status: 400 });
  }
}
