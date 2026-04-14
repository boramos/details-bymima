import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const { id } = await params;
    const credit = await prisma.storeCredit.findUnique({
      where: { id },
    });

    if (!credit) {
      return NextResponse.json(
        { success: false, error: "Store credit not found" },
        { status: 404 }
      );
    }

    await prisma.storeCredit.update({
      where: { id },
      data: {
        status: "EXPIRED",
        remainingUsd: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
