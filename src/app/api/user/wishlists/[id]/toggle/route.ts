import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: listId } = await props.params;
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Missing product slug" },
        { status: 400 }
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: listId,
      },
    });

    if (!wishlist || wishlist.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Wishlist not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: listId,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      return NextResponse.json({ success: true, data: { saved: false } });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: listId,
          productId: product.id,
          productSlug: product.slug,
          productName: product.nameEs,
        },
      });
      return NextResponse.json({ success: true, data: { saved: true } });
    }
  } catch (error) {
    console.error("[WISHLIST_TOGGLE]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
