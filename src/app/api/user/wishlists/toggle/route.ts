import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const ToggleSchema = z.object({
  slug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug } = ToggleSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true, nameEs: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, isDefault: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          name: "Favoritos",
          isDefault: true,
        },
      });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: product.id } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { saved: false } });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.nameEs,
      },
    });

    return NextResponse.json({ success: true, data: { saved: true } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] POST /api/user/wishlists/toggle error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle wishlist" }, { status: 500 });
  }
}
