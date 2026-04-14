import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const credits = await prisma.storeCredit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: credits });
  } catch (error) {
    console.error("[API] GET /api/user/store-credit error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch store credits" }, { status: 500 });
  }
}
