import { requireAdminPageSession } from "@/lib/admin-auth";
import { ProductService } from "@/services/ProductService";
import { SiteContentService } from "@/services/SiteContentService";
import { PromoSectionService } from "@/services/PromoSectionService";
import { prisma } from "@/lib/prisma";
import type { ProductWithParsedFields } from "@/services/ProductService";

export default async function AdminPage() {
  await requireAdminPageSession();

  const [products, contentEn, contentEs, promosEn, promosEs, totalUsers, activePassports, totalOrders, activeGiftCards, totalGiftCards] = await Promise.all([
    ProductService.getAllProducts({ active: undefined }),
    SiteContentService.getSectionsForLocale("en"),
    SiteContentService.getSectionsForLocale("es"),
    PromoSectionService.list("home", "en"),
    PromoSectionService.list("home", "es"),
    prisma.user.count(),
    prisma.passportSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.giftCard.count({ where: { status: "ACTIVE" } }),
    prisma.giftCard.count(),
  ]);

  const activeProducts = products.filter((p: ProductWithParsedFields) => p.active).length;
  const inactiveProducts = products.filter((p: ProductWithParsedFields) => !p.active).length;
  const bestSellers = products.filter((p: ProductWithParsedFields) => p.bestSeller).length;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Back office</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Panel de administración</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">Aquí gestionas catálogo, configuración comercial, contenido editable del home y bloques promocionales.</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Catálogo</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Productos activos</p>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{activeProducts}</p>
              <p className="mt-1 text-xs text-slate-400">de {products.length} totales</p>
            </article>
            <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Best sellers</p>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{bestSellers}</p>
              <p className="mt-1 text-xs text-slate-400">marcados como destacados</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total productos</p>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-700">{products.length}</p>
              <p className="mt-1 text-xs text-slate-400">en catálogo</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Inactivos</p>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-700">{inactiveProducts}</p>
              <p className="mt-1 text-xs text-slate-400">no visibles al público</p>
            </article>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Gift Cards</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Activas</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{activeGiftCards}</p>
                <p className="mt-1 text-xs text-slate-400">en circulación</p>
              </article>
              <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total emitidas</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-700">{totalGiftCards}</p>
                <p className="mt-1 text-xs text-slate-400">históricas</p>
              </article>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Órdenes</h2>
            </div>
            <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Total órdenes</p>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{totalOrders}</p>
              <p className="mt-1 text-xs text-slate-400">procesadas en el sistema</p>
            </article>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">👤</span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Usuarios</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Registrados</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{totalUsers}</p>
                <p className="mt-1 text-xs text-slate-400">cuentas en el sistema</p>
              </article>
              <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Passport activos</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{activePassports}</p>
                <p className="mt-1 text-xs text-slate-400">suscripciones vigentes</p>
              </article>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contenido CMS</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Secciones</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-700">{contentEn.length + contentEs.length}</p>
                <p className="mt-1 text-xs text-slate-400">bloques de texto editables</p>
              </article>
              <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Promos</p>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-slate-700">{promosEn.length + promosEs.length}</p>
                <p className="mt-1 text-xs text-slate-400">bloques publicitarios</p>
              </article>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
