import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { GiftCardService } from "@/services/GiftCardService";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const cards = await GiftCardService.listGiftCards();
    return NextResponse.json({ success: true, data: cards, count: cards.length });
  } catch (error) {
    console.error("[API] GET /api/admin/gift-cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch gift cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.initialAmountUsd !== "number" || body.initialAmountUsd <= 0) {
      return NextResponse.json(
        { success: false, error: "initialAmountUsd must be a positive number" },
        { status: 400 },
      );
    }

    const card = await GiftCardService.createGiftCard({
      catalogId: typeof body.catalogId === "string" ? body.catalogId : null,
      purchaserUserId: typeof body.purchaserUserId === "string" ? body.purchaserUserId : null,
      initialAmountUsd: body.initialAmountUsd,
      recipientName: typeof body.recipientName === "string" ? body.recipientName : null,
      recipientEmail: typeof body.recipientEmail === "string" ? body.recipientEmail : null,
      message: typeof body.message === "string" ? body.message : null,
      orderNumber: typeof body.orderNumber === "string" ? body.orderNumber : null,
      paymentProvider: typeof body.paymentProvider === "string" ? body.paymentProvider : null,
      paymentReference: typeof body.paymentReference === "string" ? body.paymentReference : null,
      expiresAt: typeof body.expiresAt === "string" ? new Date(body.expiresAt) : null,
    });

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("[API] POST /api/admin/gift-cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to create gift card" }, { status: 500 });
  }
}
