import { NextResponse } from "next/server";
import { GiftCardService } from "@/services/GiftCardService";
import { prisma } from "@/lib/prisma";

type GiftCardRecipient = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type GiftCardCheckoutBody = {
  catalogId?: string | null;
  amount: number;
  deliveryMethod: "EMAIL" | "TEXT" | "PHYSICAL";
  recipients: GiftCardRecipient[];
  message?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
};

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeKey || !siteUrl) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let body: GiftCardCheckoutBody;
  try {
    body = (await request.json()) as GiftCardCheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number." }, { status: 400 });
  }
  if (!body.deliveryMethod || !["EMAIL", "TEXT", "PHYSICAL"].includes(body.deliveryMethod)) {
    return NextResponse.json({ error: "Invalid deliveryMethod." }, { status: 400 });
  }
  if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
    return NextResponse.json({ error: "At least one recipient is required." }, { status: 400 });
  }
  if (body.recipients.length > 10) {
    return NextResponse.json({ error: "Maximum 10 recipients per order." }, { status: 400 });
  }
  if (!body.senderName || !body.senderEmail) {
    return NextResponse.json({ error: "senderName and senderEmail are required." }, { status: 400 });
  }

  const pendingCards = await Promise.all(
    body.recipients.map((recipient) =>
      GiftCardService.createGiftCard({
        catalogId: body.catalogId ?? null,
        initialAmountUsd: body.amount,
        status: "PENDING_PAYMENT",
        recipientName: recipient.name || null,
        recipientEmail: recipient.email || null,
        recipientPhone: recipient.phone || null,
        deliveryMethod: body.deliveryMethod,
        deliveryAddress: recipient.address || null,
        message: body.message || null,
        senderName: body.senderName,
        senderEmail: body.senderEmail,
        senderPhone: body.senderPhone || null,
        paymentProvider: "stripe",
      }),
    ),
  );

  const cardIds = pendingCards.map((c) => c.id).join(",");
  const totalAmountCents = Math.round(body.amount * body.recipients.length * 100);
  const recipientNames = body.recipients.map((r) => r.name).filter(Boolean).join(", ");
  const productName =
    body.recipients.length === 1
      ? `Gift Card · $${body.amount} · For ${body.recipients[0].name}`
      : `${body.recipients.length} Gift Cards · $${body.amount} each · For ${recipientNames}`;

  const payload = new URLSearchParams();
  payload.set("mode", "payment");
  payload.set("success_url", `${siteUrl}/gift-cards/success?session_id={CHECKOUT_SESSION_ID}`);
  payload.set("cancel_url", `${siteUrl}/gift-cards?cancelled=1`);
  payload.set("customer_email", body.senderEmail);
  payload.set("line_items[0][price_data][currency]", "usd");
  payload.set("line_items[0][price_data][unit_amount]", String(totalAmountCents));
  payload.set("line_items[0][price_data][product_data][name]", productName);
  payload.set("line_items[0][quantity]", "1");
  payload.set("metadata[gift_card_ids]", cardIds);
  payload.set("metadata[sender_name]", body.senderName);
  payload.set("metadata[delivery_method]", body.deliveryMethod);
  payload.set("metadata[recipient_count]", String(body.recipients.length));

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  const stripeData = (await stripeResponse.json()) as { url?: string; error?: { message?: string } };

  if (!stripeResponse.ok || !stripeData.url) {
    await cleanupPendingCards(pendingCards.map((c) => c.id));
    return NextResponse.json(
      { error: stripeData.error?.message ?? "Could not create Stripe checkout." },
      { status: 400 },
    );
  }

  return NextResponse.json({ url: stripeData.url });
}

async function cleanupPendingCards(cardIds: string[]) {
  await prisma.giftCard.deleteMany({ where: { id: { in: cardIds }, status: "PENDING_PAYMENT" } });
}
