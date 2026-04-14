import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Use JPEG, PNG, WebP or GIF." }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "File too large. Maximum 5 MB." }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "avatars");

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

    const imagePath = `/uploads/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imagePath },
    });

    return NextResponse.json({ success: true, data: { path: imagePath } });
  } catch (error) {
    console.error("[API] POST /api/user/avatar error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload avatar" }, { status: 500 });
  }
}
