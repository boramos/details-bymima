import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: {
        wishlist: { userId: session.user.id },
      },
      select: { productSlug: true },
    });

    const slugs = [...new Set(items.map((item) => item.productSlug))];

    return NextResponse.json({ success: true, data: slugs });
  } catch (error) {
    console.error("[API] GET /api/user/wishlists/saved-slugs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch saved slugs" }, { status: 500 });
  }
}
