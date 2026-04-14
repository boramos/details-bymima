import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { GiftCardService } from "@/services/GiftCardService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const presetAmounts =
      Array.isArray(body.presetAmounts)
        ? (body.presetAmounts as unknown[]).map(Number).filter((n) => !isNaN(n))
        : undefined;

    const catalog = await GiftCardService.updateCatalog(id, {
      ...(typeof body.key === "string" && { key: body.key }),
      ...(typeof body.nameEs === "string" && { nameEs: body.nameEs }),
      ...(typeof body.nameEn === "string" && { nameEn: body.nameEn }),
      ...(typeof body.descriptionEs === "string" && { descriptionEs: body.descriptionEs }),
      ...(typeof body.descriptionEn === "string" && { descriptionEn: body.descriptionEn }),
      ...(body.active !== undefined && { active: Boolean(body.active) }),
      ...(body.allowCustom !== undefined && { allowCustom: Boolean(body.allowCustom) }),
      ...(presetAmounts !== undefined && { presetAmounts }),
      ...(typeof body.minCustomAmount === "number" && { minCustomAmount: body.minCustomAmount }),
      ...(typeof body.maxCustomAmount === "number" && { maxCustomAmount: body.maxCustomAmount }),
      ...(body.imagePath !== undefined && { imagePath: typeof body.imagePath === "string" ? body.imagePath : null }),
    });

    return NextResponse.json({ success: true, data: catalog });
  } catch (error) {
    console.error("[API] PUT /api/admin/gift-card-catalogs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update catalog" }, { status: 500 });
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
    await GiftCardService.deleteCatalog(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/admin/gift-card-catalogs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete catalog" }, { status: 500 });
  }
}
