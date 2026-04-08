import { NextResponse } from "next/server";

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

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "PayPal is not configured yet." }, { status: 500 });
  }

  try {
    const { token } = (await request.json()) as { token?: string };

    if (!token) {
      return NextResponse.json({ error: "Missing PayPal token." }, { status: 400 });
    }

    const accessToken = await getPaypalAccessToken(clientId, clientSecret);
    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as { status?: string; message?: string };

    if (!response.ok) {
      return NextResponse.json({ error: data.message ?? "Could not capture PayPal order." }, { status: 400 });
    }

    return NextResponse.json({ status: data.status ?? "COMPLETED" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PayPal capture failed" }, { status: 400 });
  }
}
