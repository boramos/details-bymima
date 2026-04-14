import { z } from "zod";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createOtpCode, issueAndSendOtp, isSmsServiceConfigured, isSmsSandboxMode } from "@/lib/two-factor";

const SendOtpSchema = z.object({
  phone: z.string().min(1).max(30),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!await isSmsServiceConfigured()) {
      return NextResponse.json(
        { success: false, error: "SMS service not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { phone } = SendOtpSchema.parse(body);

    if (await isSmsSandboxMode()) {
      const { code, expiresAt } = await createOtpCode(session.user.id);
      return NextResponse.json({ success: true, sandboxCode: code, expiresAt });
    }

    await issueAndSendOtp(session.user.id, phone);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
