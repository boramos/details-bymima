import { PrismaClient } from "@prisma/client";
import { catalogProducts, getProductBySlug } from "../src/lib/catalog";
import bcrypt from "bcryptjs";

import { ConfigService } from "../src/services/ConfigService";
import { getDictionary } from "../src/lib/i18n";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  await ConfigService.initializeDefaults();

  const users = [
    { email: "admin1@detailsbymima.com", name: "Mima Admin One", password: "Admin123!", role: "ADMIN" },
    { email: "admin2@detailsbymima.com", name: "Mima Admin Two", password: "Admin123!", role: "ADMIN" },
    { email: "customer1@detailsbymima.com", name: "Mima Customer", password: "Customer123!", role: "CUSTOMER" },
  ] as const;

  console.log("👤 Seeding users...");

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

    if (existingUser) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          name: user.name,
          role: user.role,
          ...(existingUser.passwordHash ? {} : { passwordHash: await bcrypt.hash(user.password, 10) }),
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash: await bcrypt.hash(user.password, 10),
          role: user.role,
        },
      });
    }

    console.log(`✓ ${user.email} (${user.role})`);
  }

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
        imagePath: `/uploads/products/product-placeholder.svg`,
        imagePaths: JSON.stringify([`/uploads/products/product-placeholder.svg`]),
        imageEmoji: product.imageEmoji,
        gradientClass: product.gradientClass,
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
        imagePath: `/uploads/products/product-placeholder.svg`,
        imagePaths: JSON.stringify([`/uploads/products/product-placeholder.svg`]),
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
  console.log("🎁 Seeding shared includes...");

  await prisma.includeConfigurationItem.deleteMany();
  await prisma.includeConfiguration.deleteMany();
  await prisma.includeItem.deleteMany();
  await prisma.includeCategory.deleteMany();

    const chocolatesCategory = await prisma.includeCategory.create({
      data: {
        key: "chocolates",
        labelEs: "Chocolates",
        labelEn: "Chocolates",
        descriptionEs: "Elige tu estilo favorito.",
        descriptionEn: "Choose your favorite style.",
        productCategories: JSON.stringify(["bouquet", "box", "basket", "centerpiece", "orchid"]),
        inputType: "single",
        required: true,
        sortOrder: 0,
      },
    });

    const selfCareCategory = await prisma.includeCategory.create({
      data: {
        key: "self-care",
        labelEs: "Self care",
        labelEn: "Self care",
        descriptionEs: "Elige crema, jabón, colonia, vela o combínalos como quieras.",
        descriptionEn: "Choose cream, soap, cologne, candle, or mix them however you want.",
        productCategories: JSON.stringify(["bouquet", "box", "basket", "centerpiece", "orchid"]),
        inputType: "multi",
        required: false,
        sortOrder: 1,
      },
    });

    const cardCategory = await prisma.includeCategory.create({
      data: {
        key: "card",
        labelEs: "Dedicatoria",
        labelEn: "Dedication card",
        descriptionEs: "Incluye una tarjeta para tu mensaje personal.",
        descriptionEn: "Include a card for your personal message.",
        productCategories: JSON.stringify(["bouquet", "box", "basket", "centerpiece", "orchid"]),
        inputType: "single",
        required: false,
        sortOrder: 2,
      },
    });

    const itemIds: Record<string, string> = {};

    const includeItems = [
      {
        categoryId: chocolatesCategory.id,
        key: "classic",
        nameEs: "Chocolate clásico",
        nameEn: "Classic chocolate",
        priceDeltaUsd: 0,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 0,
      },
      {
        categoryId: chocolatesCategory.id,
        key: "premium",
        nameEs: "Chocolate premium",
        nameEn: "Premium chocolate",
        priceDeltaUsd: 9,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 1,
      },
      {
        categoryId: selfCareCategory.id,
        key: "body-cream-bbw",
        nameEs: "Crema Bath & Body Works",
        nameEn: "Bath & Body Works cream",
        priceDeltaUsd: 8,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 0,
      },
      {
        categoryId: selfCareCategory.id,
        key: "soft-soap",
        nameEs: "Jabón de manos",
        nameEn: "Hand soap",
        priceDeltaUsd: 7,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 1,
      },
      {
        categoryId: selfCareCategory.id,
        key: "body-mist-bbw",
        nameEs: "Mist Bath & Body Works",
        nameEn: "Bath & Body Works mist",
        priceDeltaUsd: 8,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 2,
      },
      {
        categoryId: selfCareCategory.id,
        key: "aromatic-candle",
        nameEs: "Vela aromática",
        nameEn: "Aromatic candle",
        priceDeltaUsd: 9,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 3,
      },
      {
        categoryId: selfCareCategory.id,
        key: "body-cream-vs",
        nameEs: "Crema Victoria's Secret",
        nameEn: "Victoria's Secret cream",
        priceDeltaUsd: 10,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 4,
      },
      {
        categoryId: selfCareCategory.id,
        key: "body-mist-vs",
        nameEs: "Mist Victoria's Secret",
        nameEn: "Victoria's Secret mist",
        priceDeltaUsd: 10,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 5,
      },
      {
        categoryId: cardCategory.id,
        key: "dedication-card",
        nameEs: "Tarjeta dedicatoria",
        nameEn: "Dedication card",
        priceDeltaUsd: 5,
        imagePath: "/uploads/products/product-placeholder.svg",
        sortOrder: 0,
      },
    ] as const;

    for (const item of includeItems) {
      const createdItem = await prisma.includeItem.create({
        data: {
          ...item,
          active: true,
        },
      });

      itemIds[item.key] = createdItem.id;
    }

    const configurations = [
      {
        key: "standard",
        labelEs: "Standard",
        labelEn: "Standard",
        descriptionEs: "Base esencial del regalo.",
        descriptionEn: "Essential gift base.",
        sortOrder: 0,
        includeItemKeys: ["classic"],
      },
      {
        key: "premium",
        labelEs: "Premium",
        labelEn: "Premium",
        descriptionEs: "Incluye chocolate premium, self-care y tarjeta.",
        descriptionEn: "Includes premium chocolate, self-care, and card.",
        sortOrder: 1,
        includeItemKeys: ["premium", "body-cream-bbw", "body-mist-bbw", "dedication-card"],
      },
      {
        key: "deluxe",
        labelEs: "Deluxe",
        labelEn: "Deluxe",
        descriptionEs: "Incluye chocolate premium, self-care expandido y tarjeta.",
        descriptionEn: "Includes premium chocolate, expanded self-care, and card.",
        sortOrder: 2,
        includeItemKeys: ["premium", "body-cream-bbw", "body-mist-bbw", "aromatic-candle", "dedication-card"],
      },
      {
        key: "luxury",
        labelEs: "Luxury",
        labelEn: "Luxury",
        descriptionEs: "Selección completa con piezas premium de self-care y tarjeta.",
        descriptionEn: "Full selection with premium self-care pieces and card.",
        sortOrder: 3,
        includeItemKeys: ["premium", "body-cream-vs", "body-mist-vs", "aromatic-candle", "dedication-card"],
      },
    ] as const;

    for (const configuration of configurations) {
      await prisma.includeConfiguration.create({
        data: {
          key: configuration.key,
          labelEs: configuration.labelEs,
          labelEn: configuration.labelEn,
          descriptionEs: configuration.descriptionEs,
          descriptionEn: configuration.descriptionEn,
          productCategories: JSON.stringify(["bouquet", "box", "basket", "centerpiece", "orchid"]),
          active: true,
          sortOrder: configuration.sortOrder,
          items: {
            create: configuration.includeItemKeys.map((includeItemKey) => ({
              includeItemId: itemIds[includeItemKey],
            })),
          },
        },
      });
    }

  const dictionaryEn = getDictionary("en");
  const dictionaryEs = getDictionary("es");

  const contentSections = [
    { sectionKey: "homeBanner", locale: "en", value: dictionaryEn.homeBanner },
    { sectionKey: "homeBanner", locale: "es", value: dictionaryEs.homeBanner },
    { sectionKey: "bestSellers", locale: "en", value: dictionaryEn.bestSellers },
    { sectionKey: "bestSellers", locale: "es", value: dictionaryEs.bestSellers },
    { sectionKey: "about", locale: "en", value: dictionaryEn.about },
    { sectionKey: "about", locale: "es", value: dictionaryEs.about },
    { sectionKey: "contact", locale: "en", value: dictionaryEn.contact },
    { sectionKey: "contact", locale: "es", value: dictionaryEs.contact },
  ] as const;

  console.log("📝 Seeding editable content...");

  for (const section of contentSections) {
    const exists = await prisma.siteContent.findUnique({
      where: {
        sectionKey_locale: {
          sectionKey: section.sectionKey,
          locale: section.locale,
        },
      },
    });

    if (!exists) {
      await prisma.siteContent.create({
        data: {
          sectionKey: section.sectionKey,
          locale: section.locale,
          value: JSON.stringify(section.value),
        },
      });
    }
  }

  console.log("📣 Seeding promo sections...");

  const promoCount = await prisma.promoSection.count();

  if (promoCount === 0) {
    await prisma.promoSection.createMany({
      data: [
        {
          pageKey: "home",
          locale: "en",
          badge: "Seasonal Edit",
          title: "Fresh arrivals for same-week gifting",
          description: "Highlight your limited editions, event florals, or a special collection from the admin panel.",
          ctaLabel: "Explore collection",
          ctaHref: "/order",
          backgroundClass: "from-rose-100 via-white to-orange-100",
          active: true,
          sortOrder: 0,
        },
        {
          pageKey: "home",
          locale: "es",
          badge: "Edición de temporada",
          title: "Nuevas propuestas para regalos de esta semana",
          description: "Destaca tus ediciones limitadas, flores para eventos o una colección especial desde el panel admin.",
          ctaLabel: "Explorar colección",
          ctaHref: "/order",
          backgroundClass: "from-rose-100 via-white to-orange-100",
          active: true,
          sortOrder: 0,
        },
      ],
    });
  }

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
