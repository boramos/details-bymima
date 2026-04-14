import { requireAdminPageSession } from "@/lib/admin-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { PromoSectionService } from "@/services/PromoSectionService";
import { AdminPromosPage } from "@/components/admin/AdminPromos";

export default async function PromosPage() {
  await requireAdminPageSession();
  const locale = await getRequestLocale();
  const promos = await PromoSectionService.list("home", locale);
  
  return <AdminPromosPage initialPromos={promos} locale={locale} />;
}
