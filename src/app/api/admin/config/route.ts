import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { ConfigService } from "@/services/ConfigService";

export async function GET() {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const configs = await ConfigService.listAll();
  return NextResponse.json({ success: true, data: configs });
}

export async function PUT(request: Request) {
  const { response } = await requireAdminApiSession();

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    key?: string;
    value?: string | number | boolean | object;
    description?: string;
    category?: string;
  };

  if (!body.key || body.value === undefined) {
    return NextResponse.json({ success: false, error: "Missing config key or value" }, { status: 400 });
  }

  if (typeof body.key !== "string") {
    return NextResponse.json({ success: false, error: "Invalid config key" }, { status: 400 });
  }

  await ConfigService.set(body.key as never, body.value, body.description, body.category);
  return NextResponse.json({ success: true });
}
