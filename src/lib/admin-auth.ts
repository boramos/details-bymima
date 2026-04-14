import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

function isAdminRole(role: unknown) {
  return typeof role === "string" && role.toLowerCase() === "admin";
}

export async function requireAdminPageSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/account");
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAdminRole(session.user.role)) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, response: null };
}
