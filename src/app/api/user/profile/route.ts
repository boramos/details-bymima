import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
});

const UpdateEmailSchema = z.object({
  newEmail: z.string().email(),
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const UpdateTwoFactorSchema = z.object({
  twoFactorEnabled: z.boolean(),
  twoFactorPhone: z.string().max(30).optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, phone: true, email: true, image: true, twoFactorEnabled: true, twoFactorPhone: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[API] GET /api/user/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if ("newEmail" in body) {
      const validated = UpdateEmailSchema.parse(body);

      const existing = await prisma.user.findUnique({ where: { email: validated.newEmail } });
      if (existing) {
        return NextResponse.json({ success: false, error: "Este correo ya está en uso" }, { status: 409 });
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { email: validated.newEmail },
        select: { id: true, name: true, phone: true, email: true, image: true },
      });

      return NextResponse.json({ success: true, data: user });
    }

    if ("newPassword" in body) {
      const validated = UpdatePasswordSchema.parse(body);

      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!currentUser?.passwordHash) {
        return NextResponse.json(
          { success: false, error: "Cannot change password for OAuth accounts" },
          { status: 400 }
        );
      }

      const passwordValid = await bcrypt.compare(validated.currentPassword, currentUser.passwordHash);
      if (!passwordValid) {
        return NextResponse.json({ success: false, error: "Contraseña actual incorrecta" }, { status: 400 });
      }

      const newHash = await bcrypt.hash(validated.newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ success: true });
    }

    if ("twoFactorEnabled" in body) {
      const validated = UpdateTwoFactorSchema.parse(body);
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: validated.twoFactorEnabled,
          twoFactorPhone: validated.twoFactorPhone ?? null,
        },
        select: { id: true, twoFactorEnabled: true, twoFactorPhone: true },
      });
      return NextResponse.json({ success: true, data: user });
    }

    const validated = UpdateProfileSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validated,
      select: { id: true, name: true, phone: true, email: true, image: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("[API] PATCH /api/user/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
