import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LoginTwoFactorForm from "@/components/auth/LoginTwoFactorForm";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

type LoginTwoFactorPageProps = {
  searchParams: Promise<{
    email?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginTwoFactorPage({ searchParams }: LoginTwoFactorPageProps) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const { email, redirectTo } = await searchParams;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[var(--color-primary-light)]/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-[var(--color-primary-pale)] blur-[80px]" />

        <div className="relative z-10 w-full max-w-4xl animate-fade-in-up">
          <div className="flex justify-center">
            <LoginTwoFactorForm
              email={typeof email === "string" ? email : ""}
              locale={locale}
              redirectTo={typeof redirectTo === "string" ? redirectTo : "/account"}
            />
          </div>
        </div>
      </div>

      <Footer content={dictionary.footer} />
    </main>
  );
}
