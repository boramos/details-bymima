import { auth } from "@/auth";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  if (session?.user) {
    redirect("/account");
  }

  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
        <AdminLoginForm content={dictionary.loginUi} />
      </div>
    </main>
  );
}
