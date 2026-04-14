import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email query param required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email } },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
