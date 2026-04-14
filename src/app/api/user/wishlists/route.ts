import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const CreateWishlistSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          orderBy: { addedAt: "desc" },
          include: { product: { select: { id: true, slug: true, nameEs: true, nameEn: true, imagePath: true, imageEmoji: true, gradientClass: true, basePriceCop: true } } },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, data: wishlists });
  } catch (error) {
    console.error("[API] GET /api/user/wishlists error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlists" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateWishlistSchema.parse(body);

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        isDefault: false,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: wishlist });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] POST /api/user/wishlists error:", error);
    return NextResponse.json({ success: false, error: "Failed to create wishlist" }, { status: 500 });
  }
}
