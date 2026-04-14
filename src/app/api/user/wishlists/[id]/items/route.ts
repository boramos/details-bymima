import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const AddItemSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: wishlistId } = await params;
    const body = await request.json();
    const validated = AddItemSchema.parse(body);

    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, userId: session.user.id },
    });

    if (!wishlist) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      select: { id: true, slug: true, nameEs: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const item = await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId, productId: validated.productId } },
      update: {},
      create: {
        wishlistId,
        productId: validated.productId,
        productSlug: product.slug,
        productName: product.nameEs,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] POST /api/user/wishlists/[id]/items error:", error);
    return NextResponse.json({ success: false, error: "Failed to add item" }, { status: 500 });
  }
}
