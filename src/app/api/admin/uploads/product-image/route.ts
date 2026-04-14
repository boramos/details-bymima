import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase() || ".png";
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ success: true, data: { path: `/uploads/products/${fileName}` } });
}
