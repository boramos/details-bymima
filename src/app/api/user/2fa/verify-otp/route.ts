import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const VerifyOtpSchema = z.object({
  code: z.string().length(6),
  phone: z.string().min(1).max(30),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, phone } = VerifyOtpSchema.parse(body);

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: session.user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.code !== code) {
      return NextResponse.json(
        { success: false, error: "Código inválido o expirado" },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });

    await prisma.$transaction([
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorPhone: phone,
          ...(currentUser && !currentUser.phone ? { phone } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { twoFactorEnabled: true },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Failed to verify OTP" }, { status: 500 });
  }
}
