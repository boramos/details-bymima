import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeaderActions } from "@/components/admin/layout/AdminHeaderActions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="flex min-h-screen">
        {isAdmin ? <AdminSidebar session={session as any} /> : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 lg:hidden">Admin panel</p>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Centro de administración</h2>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{session.user?.role}</span>
                    <span className="hidden sm:inline">{session.user?.email}</span>
                  </div>
                  <AdminHeaderActions />
                </div>
              ) : null}
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
