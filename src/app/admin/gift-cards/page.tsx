import { requireAdminPageSession } from "@/lib/admin-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { GiftCardService } from "@/services/GiftCardService";
import { AdminGiftCards } from "@/components/admin/AdminGiftCards";

export default async function GiftCardsPage() {
  await requireAdminPageSession();
  const locale = await getRequestLocale();
  const [catalogs, giftCards] = await Promise.all([
    GiftCardService.listCatalogs(),
    GiftCardService.listGiftCards(),
  ]);

  return <AdminGiftCards initialCatalogs={catalogs} initialGiftCards={giftCards} locale={locale} />;
}
