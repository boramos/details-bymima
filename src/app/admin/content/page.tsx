import { requireAdminPageSession } from "@/lib/admin-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { SiteContentService } from "@/services/SiteContentService";
import { AdminContentPage } from "@/components/admin/AdminContent";

export default async function ContentPage() {
  await requireAdminPageSession();
  const locale = await getRequestLocale();
  const content = await SiteContentService.getSectionsForLocale(locale);
  
  return <AdminContentPage initialContent={content} locale={locale} />;
}
