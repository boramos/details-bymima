import { requireAdminPageSession } from "@/lib/admin-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { ProductService } from "@/services/ProductService";
import { AdminProducts } from "@/components/admin/AdminProducts";

export default async function ProductsPage() {
  await requireAdminPageSession();
  const locale = await getRequestLocale();
  const products = await ProductService.getAllProducts({ active: undefined });
  
  return <AdminProducts initialProducts={products} locale={locale} />;
}
