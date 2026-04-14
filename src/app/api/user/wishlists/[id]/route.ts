import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const wishlist = await prisma.wishlist.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!wishlist) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (wishlist.isDefault) {
      return NextResponse.json({ success: false, error: "Cannot delete default wishlist" }, { status: 400 });
    }

    await prisma.wishlist.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/user/wishlists/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete wishlist" }, { status: 500 });
  }
}
