import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductDetailExperience from "@/components/product/ProductDetailExperience";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { dbProductToCatalogProductDetail } from "@/lib/product-adapter";
import { ProductService } from "@/services/ProductService";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await ProductService.getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dbProduct = await ProductService.getProductBySlug(slug);

  if (!dbProduct) {
    return {};
  }

  const product = dbProductToCatalogProductDetail(dbProduct);

  return {
    title: `Details by MIMA | ${product.name[locale]}`,
    description: product.longDescription[locale],
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const dbProduct = await ProductService.getProductBySlug(slug);

  if (!dbProduct) {
    notFound();
  }

  const product = dbProductToCatalogProductDetail(dbProduct);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-cream)]">
      <Navbar content={dictionary.navbar} />
      <div className="pt-28">
        <ProductDetailExperience product={product} locale={locale} ui={dictionary.productUi} checkoutUi={dictionary.checkoutUi} />
      </div>
      <Footer content={dictionary.footer} />
    </main>
  );
}
