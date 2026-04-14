import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { GiftCardService } from "@/services/GiftCardService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const { id } = await params;
    const card = await GiftCardService.getGiftCardById(id);

    if (!card) {
      return NextResponse.json({ success: false, error: "Gift card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("[API] GET /api/admin/gift-cards/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch gift card" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    if (body.action === "deactivate") {
      const card = await GiftCardService.deactivateGiftCard(id);
      return NextResponse.json({ success: true, data: card });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[API] PUT /api/admin/gift-cards/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update gift card" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const { id } = await params;
    await GiftCardService.deactivateGiftCard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/admin/gift-cards/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to deactivate gift card" }, { status: 500 });
  }
}
