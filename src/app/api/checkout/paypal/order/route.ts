import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { buildCheckoutQuote, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { PassportService } from "@/services/PassportService";

type PaypalCheckoutBody = {
  locale?: Locale;
  items?: CheckoutDraftItem[];
  deliveryMethod?: CheckoutDeliveryMethod;
  hasPassport?: boolean;
  customer?: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
};

async function getPaypalAccessToken(clientId: string, clientSecret: string) {
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = (await response.json()) as { access_token?: string; error_description?: string };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Unable to authenticate with PayPal");
  }

  return data.access_token;
}

export async function POST(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !clientSecret || !siteUrl) {
    return NextResponse.json({ error: "PayPal is not configured yet." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as PaypalCheckoutBody;
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

    const accessToken = await getPaypalAccessToken(clientId, clientSecret);
    const response = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "Details by MIMA order",
            custom_id: JSON.stringify({
              hasActivePassport: quote.hasActivePassport,
              passportApplied: quote.passportApplied,
              deliveryMethod: quote.deliveryMethod,
            }),
            amount: {
              currency_code: "USD",
              value: quote.total.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${siteUrl}/checkout/paypal-return`,
          cancel_url: `${siteUrl}/checkout?cancelled=1`,
        },
      }),
    });

    const data = (await response.json()) as { links?: Array<{ rel: string; href: string }>; message?: string };
    const approvalLink = data.links?.find((link) => link.rel === "approve")?.href;

    if (!response.ok || !approvalLink) {
      return NextResponse.json({ error: data.message ?? "Could not create PayPal order." }, { status: 400 });
    }

    return NextResponse.json({ url: approvalLink });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PayPal checkout failed" }, { status: 400 });
  }
}
