import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

const UpdateNewsletterSchema = z.object({
  email: z.string().email().optional(),
  active: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = UpdateNewsletterSchema.parse(body);

    const userEmail = session.user.email!;
    const email = validated.email || userEmail;

    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email },
      update: { active: validated.active, userId: session.user.id },
      create: {
        email,
        active: validated.active,
        userId: session.user.id,
        source: "account",
      },
    });

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] PATCH /api/user/subscriptions/newsletter error:", error);
    return NextResponse.json({ success: false, error: "Failed to update newsletter subscription" }, { status: 500 });
  }
}
