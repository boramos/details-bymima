import { NextResponse } from "next/server";
import { GiftCardService } from "@/services/GiftCardService";
import { sendGiftCardReceipt } from "@/lib/email";
import type { GiftCardReceiptData } from "@/lib/receipt-types";

type ActivateRequestBody = {
  sessionId: string;
};

type StripeSession = {
  id: string;
  payment_status: string;
  customer_email: string | null;
  metadata: Record<string, string>;
};

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let body: ActivateRequestBody;
  try {
    body = (await request.json()) as ActivateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.sessionId || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(body.sessionId)}`,
    {
      headers: { Authorization: `Bearer ${stripeKey}` },
    },
  );

  if (!stripeResponse.ok) {
    return NextResponse.json({ error: "Could not retrieve Stripe session." }, { status: 400 });
  }

  const session = (await stripeResponse.json()) as StripeSession;

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not completed.", paymentStatus: session.payment_status },
      { status: 402 },
    );
  }

  const rawIds = session.metadata?.gift_card_ids ?? "";
  const cardIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (cardIds.length === 0) {
    return NextResponse.json({ error: "No gift card IDs found in session metadata." }, { status: 400 });
  }

  const activatedCards = await GiftCardService.activatePendingCards(cardIds, body.sessionId);

  if (activatedCards.length > 0) {
    const firstCard = activatedCards[0];
    const senderName = firstCard.senderName ?? session.metadata?.sender_name ?? "";
    const senderEmail = firstCard.senderEmail ?? session.customer_email ?? "";

    if (senderEmail) {
      const receiptData: GiftCardReceiptData = {
        senderName,
        senderEmail,
        date: new Date().toISOString(),
        cards: activatedCards.map((c) => ({
          code: c.code,
          amount: c.initialAmountUsd,
          recipientName: c.recipientName ?? "",
          recipientEmail: c.recipientEmail ?? "",
          deliveryMethod: c.deliveryMethod,
        })),
        totalAmountUsd: activatedCards.reduce((sum, c) => sum + c.initialAmountUsd, 0),
      };
      void sendGiftCardReceipt(receiptData);
    }
  }

  return NextResponse.json({
    success: true,
    cards: activatedCards.map((c) => ({
      id: c.id,
      code: c.code,
      recipientName: c.recipientName,
      recipientEmail: c.recipientEmail,
      recipientPhone: c.recipientPhone,
      deliveryMethod: c.deliveryMethod,
      initialAmountUsd: c.initialAmountUsd,
    })),
  });
}
