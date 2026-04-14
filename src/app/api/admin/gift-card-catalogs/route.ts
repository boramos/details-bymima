import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { GiftCardService } from "@/services/GiftCardService";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const catalogs = await GiftCardService.listCatalogs();
    return NextResponse.json({ success: true, data: catalogs, count: catalogs.length });
  } catch (error) {
    console.error("[API] GET /api/admin/gift-card-catalogs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch catalogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.key !== "string" ||
      typeof body.nameEs !== "string" ||
      typeof body.nameEn !== "string" ||
      typeof body.descriptionEs !== "string" ||
      typeof body.descriptionEn !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: key, nameEs, nameEn, descriptionEs, descriptionEn" },
        { status: 400 },
      );
    }

    const presetAmounts = Array.isArray(body.presetAmounts)
      ? (body.presetAmounts as unknown[]).map(Number).filter((n) => !isNaN(n))
      : [10, 20, 50, 100];

    const catalog = await GiftCardService.createCatalog({
      key: body.key,
      nameEs: body.nameEs,
      nameEn: body.nameEn,
      descriptionEs: body.descriptionEs,
      descriptionEn: body.descriptionEn,
      active: body.active === undefined ? true : Boolean(body.active),
      allowCustom: body.allowCustom === undefined ? true : Boolean(body.allowCustom),
      presetAmounts,
      minCustomAmount: typeof body.minCustomAmount === "number" ? body.minCustomAmount : 10,
      maxCustomAmount: typeof body.maxCustomAmount === "number" ? body.maxCustomAmount : 500,
      imagePath: typeof body.imagePath === "string" ? body.imagePath : null,
    });

    return NextResponse.json({ success: true, data: catalog });
  } catch (error) {
    console.error("[API] POST /api/admin/gift-card-catalogs error:", error);
    return NextResponse.json({ success: false, error: "Failed to create catalog" }, { status: 500 });
  }
}
