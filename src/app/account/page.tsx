import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { OrderService } from "@/services/OrderService";
import { UserService } from "@/services/UserService";
import AccountDashboard from "@/components/account/AccountDashboard";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const { user } = session;

  const [orders, fullUser] = await Promise.all([
    OrderService.getOrdersByUser(user.id!),
    UserService.getUserById(user.id!),
  ]);

  if (!fullUser) {
    redirect("/login");
  }

  const initialData = {
    user: fullUser,
    orders,
    sessionUser: user,
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <AccountDashboard initialData={initialData} ui={dictionary.loginUi} locale={locale} />
      </div>
      <Footer content={dictionary.footer} />
    </main>
  );
}