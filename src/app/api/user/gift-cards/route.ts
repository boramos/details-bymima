import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const giftCards = await prisma.giftCard.findMany({
      where: { purchaserUserId: session.user.id },
      include: {
        catalog: { select: { nameEs: true, nameEn: true } },
        redemptions: { select: { amountUsd: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: giftCards });
  } catch (error) {
    console.error("[API] GET /api/user/gift-cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch gift cards" }, { status: 500 });
  }
}
