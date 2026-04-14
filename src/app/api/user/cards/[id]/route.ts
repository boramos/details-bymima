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

    const card = await prisma.savedCard.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    await prisma.savedCard.delete({ where: { id } });

    if (card.isDefault) {
      const next = await prisma.savedCard.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.savedCard.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] DELETE /api/user/cards/${id} error:`, error);
    return NextResponse.json({ success: false, error: "Failed to delete card" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { isDefault?: boolean; nickname?: string | null; cardCvc?: string | null };

    const card = await prisma.savedCard.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    if (body.isDefault === true) {
      await prisma.savedCard.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.savedCard.update({
      where: { id },
      data: {
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
        ...(body.nickname !== undefined && { nickname: body.nickname }),
        ...(body.cardCvc !== undefined && { cardCvc: body.cardCvc }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] PATCH /api/user/cards/${id} error:`, error);
    return NextResponse.json({ success: false, error: "Failed to update card" }, { status: 500 });
  }
}
