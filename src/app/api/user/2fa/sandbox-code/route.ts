import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSmsSandboxMode } from "@/lib/two-factor";
import { UserService } from "@/services/UserService";

export async function GET(request: NextRequest) {
  const sandbox = await isSmsSandboxMode();
  if (!sandbox) {
    return NextResponse.json({ sandboxCode: null });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ sandboxCode: null });
  }

  const user = await UserService.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ sandboxCode: null });
  }

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sandboxCode: otp?.code ?? null });
}
