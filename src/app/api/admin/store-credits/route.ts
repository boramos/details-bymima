import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  userId: z.string().min(1),
  amountUsd: z.number().int().min(1).max(10000),
  reason: z.enum(["REFUND", "PROMOTION", "REFERRAL", "MANUAL"]),
  note: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const credits = await prisma.storeCredit.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const userAggregates = await prisma.storeCredit.groupBy({
      by: ["userId"],
      where: { status: "ACTIVE" },
      _sum: { remainingUsd: true },
    });

    const aggregateMap = new Map(
      userAggregates.map((agg) => [agg.userId, agg._sum.remainingUsd ?? 0])
    );

    const data = credits.map((credit) => ({
      ...credit,
      userTotalActiveUsd: aggregateMap.get(credit.userId) ?? 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const json = await req.json();
    const body = createSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const created = await prisma.storeCredit.create({
      data: {
        userId: body.userId,
        amountUsd: body.amountUsd,
        remainingUsd: body.amountUsd,
        reason: body.reason,
        note: body.note ?? null,
        status: "ACTIVE",
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
