import { PrismaClient } from "@prisma/client";
import { catalogProducts, getProductBySlug } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  console.log("📦 Seeding products...");
  
  for (const product of catalogProducts) {
    const detail = getProductBySlug(product.slug);
    
    if (!detail) {
      console.warn(`⚠️  Could not get details for ${product.slug}, skipping`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        nameEs: product.name.es,
        nameEn: product.name.en,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        longDescriptionEs: detail.longDescription.es,
        longDescriptionEn: detail.longDescription.en,
        basePriceCop: detail.basePriceCop,
        imageEmoji: product.imageEmoji,
        gradientClass: product.gradientClass,
        bestSeller: product.bestSeller,
        active: true,
        categories: JSON.stringify(product.categories),
        colors: JSON.stringify(product.colors),
        styles: JSON.stringify(product.styles),
        tags: JSON.stringify(product.tags),
        optionGroups: JSON.stringify(detail.optionGroups),
      },
      create: {
        slug: product.slug,
        nameEs: product.name.es,
        nameEn: product.name.en,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        longDescriptionEs: detail.longDescription.es,
        longDescriptionEn: detail.longDescription.en,
        basePriceCop: detail.basePriceCop,
        imageEmoji: product.imageEmoji,
        gradientClass: product.gradientClass,
        bestSeller: product.bestSeller,
        active: true,
        categories: JSON.stringify(product.categories),
        colors: JSON.stringify(product.colors),
        styles: JSON.stringify(product.styles),
        tags: JSON.stringify(product.tags),
        optionGroups: JSON.stringify(detail.optionGroups),
      },
    });

    console.log(`✓ ${product.name.en} (${product.slug})`);
  }

  const count = await prisma.product.count();
  console.log(`\n✅ Seeded ${count} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
