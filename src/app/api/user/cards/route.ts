import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const SaveCardSchema = z.object({
  last4: z.string().length(4).regex(/^\d+$/),
  brand: z.enum(["visa", "mastercard", "amex", "discover"]),
  expiryMonth: z.string().length(2).regex(/^\d+$/),
  expiryYear: z.string().length(4).regex(/^\d+$/),
  cardCvc: z.string().min(3).max(4).regex(/^\d+$/).optional().nullable(),
  nickname: z.string().max(50).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.savedCard.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error("[API] GET /api/user/cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = SaveCardSchema.parse(body);

    if (validated.isDefault) {
      await prisma.savedCard.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const isFirst = (await prisma.savedCard.count({ where: { userId: session.user.id } })) === 0;

    const card = await prisma.savedCard.create({
      data: {
        userId: session.user.id,
        last4: validated.last4,
        brand: validated.brand,
        expiryMonth: validated.expiryMonth,
        expiryYear: validated.expiryYear,
        cardCvc: validated.cardCvc ?? null,
        nickname: validated.nickname ?? null,
        isDefault: validated.isDefault ?? isFirst,
      },
    });

    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] POST /api/user/cards error:", error);
    return NextResponse.json({ success: false, error: "Failed to save card" }, { status: 500 });
  }
}
