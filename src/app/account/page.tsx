import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, signOut } from "@/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const ui = dictionary.loginUi;
  const { user } = session;

  const roleLabel =
    user.role === "admin" ? ui.accountRoleAdmin : ui.accountRoleCustomer;

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />

      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl animate-fade-in-up">
          <div className="rounded-3xl border border-[var(--color-primary-pale)] bg-white shadow-[0_8px_32px_rgba(28,25,23,0.06)] overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary-pale)] px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-full ring-4 ring-white/70 object-cover shrink-0"
                />
              ) : (
                <div className="h-[72px] w-[72px] rounded-full bg-[var(--color-primary)] ring-4 ring-white/70 flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-playfair)] shrink-0">
                  {initials}
                </div>
              )}

              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                  {ui.accountGreeting}, {user.name ?? user.email}
                </h1>
                <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
                <span className="inline-flex items-center rounded-full bg-white/60 border border-white/70 px-3 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                  {ui.myOrdersTitle}
                </h2>
                <div className="rounded-2xl border border-[var(--color-primary-pale)] bg-[var(--color-primary-pale)]/40 px-6 py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-[var(--color-primary)]">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto">{ui.myOrdersEmpty}</p>
                  <Link
                    href="/order"
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 hover:brightness-95"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </section>

              <div className="border-t border-[var(--color-primary-pale)] pt-6">
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-light)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--color-dark)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {ui.logoutButton}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer content={dictionary.footer} />
    </main>
  );
}
