import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen overflow-x-hidden flex flex-col bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      
      <div className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary-light)]/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary-pale)] blur-[80px] pointer-events-none" />
        
        <div className="relative w-full max-w-4xl z-10 animate-fade-in-up">
          <LoginForm content={dictionary.loginUi} />
        </div>
      </div>

      <Footer content={dictionary.footer} />
    </main>
  );
}
