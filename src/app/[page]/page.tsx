import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CatalogRoutePage from "@/components/catalog/CatalogRoutePage";
import { catalogPages, getCatalogPageBySegments } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n";
import { dbProductsToCatalogProducts } from "@/lib/product-adapter";
import { getRequestLocale } from "@/lib/request-locale";
import { ProductService } from "@/services/ProductService";

type Params = Promise<{ page: string }>;

export async function generateStaticParams() {
  return catalogPages
    .filter((page) => page.slugSegments.length === 1)
    .map((page) => ({ page: page.slugSegments[0] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { page } = await params;
  const locale = await getRequestLocale();
  const pageDefinition = getCatalogPageBySegments([page]);

  if (!pageDefinition) {
    return {};
  }

  return {
    title: `Details by MIMA | ${pageDefinition.title[locale]}`,
    description: pageDefinition.description[locale],
  };
}

export default async function DynamicTopLevelPage({ params }: { params: Params }) {
  const { page } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const pageDefinition = getCatalogPageBySegments([page]);

  if (!pageDefinition) {
    notFound();
  }

  const dbProducts =
    pageDefinition.key === "order"
      ? await ProductService.getAllProducts()
      : await ProductService.getAllProducts({ tag: pageDefinition.key });

  const products = dbProductsToCatalogProducts(dbProducts);

  return <CatalogRoutePage page={pageDefinition} products={products} locale={locale} dictionary={dictionary} />;
}
