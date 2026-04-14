"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

export function AdminSidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  const links = [
    { label: "Resumen", href: "/admin", icon: "📊", exact: true },
    { label: "Productos", href: "/admin/products", icon: "🌸", exact: false },
    { label: "Includes", href: "/admin/includes", icon: "📦", exact: false },
    { label: "Configuración", href: "/admin/settings", icon: "⚙️", exact: false },
    { label: "Contenido", href: "/admin/content", icon: "📝", exact: false },
    { label: "Publicidad", href: "/admin/promos", icon: "📣", exact: false },
    { label: "Gift Cards", href: "/admin/gift-cards", icon: "🎁", exact: false },
    { label: "Créditos", href: "/admin/store-credits", icon: "💳", exact: false },
    { label: "Usuarios", href: "/admin/users", icon: "👥", exact: false },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">Admin panel</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Details by Mima</h1>
        <p className="mt-2 text-sm text-slate-300">Administración del catálogo, contenido y configuración del sitio.</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {links.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-6 py-5 text-sm text-slate-300">
        <p className="font-medium text-white">{session.user?.name ?? session.user?.email}</p>
        <p className="mt-1">{session.user?.email}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/account" className="inline-flex text-rose-300 transition hover:text-rose-200">Ir a mi cuenta</Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="inline-flex text-left text-slate-400 transition hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
