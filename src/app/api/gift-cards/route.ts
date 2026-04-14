import { NextResponse } from "next/server";
import { GiftCardService } from "@/services/GiftCardService";

export async function GET() {
  try {
    const catalogs = await GiftCardService.listCatalogs(true);
    return NextResponse.json({ success: true, data: catalogs, count: catalogs.length });
  } catch (error) {
    console.error("[API] GET /api/gift-cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch gift card catalogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.initialAmountUsd !== "number" || body.initialAmountUsd <= 0) {
      return NextResponse.json(
        { success: false, error: "initialAmountUsd must be a positive number" },
        { status: 400 },
      );
    }

    const card = await GiftCardService.createGiftCard({
      catalogId: typeof body.catalogId === "string" && body.catalogId ? body.catalogId : null,
      purchaserUserId: null,
      initialAmountUsd: body.initialAmountUsd,
      recipientName: typeof body.recipientName === "string" ? body.recipientName : null,
      recipientEmail: typeof body.recipientEmail === "string" ? body.recipientEmail : null,
      message: typeof body.message === "string" ? body.message : null,
      orderNumber: null,
      paymentProvider: null,
      paymentReference: null,
      expiresAt: null,
    });

    return NextResponse.json({ success: true, data: { code: card.code } });
  } catch (error) {
    console.error("[API] POST /api/gift-cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to create gift card" }, { status: 500 });
  }
}
