import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    const item = await prisma.wishlistItem.findFirst({
      where: { id: itemId, wishlist: { userId: session.user.id } },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    await prisma.wishlistItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/user/wishlists/items/[itemId] error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove item" }, { status: 500 });
  }
}
