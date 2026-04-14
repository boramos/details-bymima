import { NextResponse } from "next/server";
import { GiftCardService } from "@/services/GiftCardService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const card = await GiftCardService.getGiftCardByCode(code.toUpperCase());

    if (!card) {
      return NextResponse.json({ success: false, error: "Gift card not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        code: card.code,
        status: card.status,
        initialAmountUsd: card.initialAmountUsd,
        remainingAmountUsd: card.remainingAmountUsd,
        expiresAt: card.expiresAt,
        recipientName: card.recipientName,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/gift-cards/[code] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch gift card" }, { status: 500 });
  }
}
