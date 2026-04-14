"use client";

import { signOut } from "next-auth/react";

export function AdminHeaderActions() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/admin/login" })}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
    >
      Cerrar sesión
    </button>
  );
}
