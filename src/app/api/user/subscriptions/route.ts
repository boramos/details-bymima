import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [passport, newsletter] = await Promise.all([
      prisma.passportSubscription.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.newsletterSubscription.findFirst({
        where: { userId: session.user.id },
      }),
    ]);

    const isPassportActive = passport
      ? passport.status === "ACTIVE" && new Date(passport.endDate) > new Date()
      : false;

    return NextResponse.json({
      success: true,
      data: {
        passport: passport
          ? {
              id: passport.id,
              status: passport.status,
              startDate: passport.startDate,
              endDate: passport.endDate,
              autoRenew: passport.autoRenew,
              isActive: isPassportActive,
            }
          : null,
        newsletter: newsletter
          ? { id: newsletter.id, email: newsletter.email, active: newsletter.active }
          : null,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/user/subscriptions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
