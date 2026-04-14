import { requireAdminPageSession } from "@/lib/admin-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { IncludeService } from "@/services/IncludeService";
import { AdminIncludes } from "@/components/admin/AdminIncludes";

export default async function IncludesPage() {
  await requireAdminPageSession();

  const locale = await getRequestLocale();
  const snapshot = await IncludeService.getSnapshot();

  return <AdminIncludes initialSnapshot={snapshot} locale={locale} />;
}
