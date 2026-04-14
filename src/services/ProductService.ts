import { prisma } from "@/lib/prisma";
import { IncludeService } from "@/services/IncludeService";

type PrismaProductRecord = NonNullable<Awaited<ReturnType<typeof prisma.product.findUnique>>>;

export interface ProductFilters {
  category?: string;
  color?: string;
  style?: string;
  tag?: string;
  bestSeller?: boolean;
  active?: boolean;
  search?: string;
}

export interface ProductWithParsedFields extends Omit<PrismaProductRecord, 'categories' | 'colors' | 'styles' | 'tags' | 'optionGroups' | 'imagePaths'> {
  categories: string[];
  colors: string[];
  styles: string[];
  tags: string[];
  imagePaths: string[];
  optionGroups: unknown[];
}

export interface ProductUpsertInput {
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  longDescriptionEs?: string | null;
  longDescriptionEn?: string | null;
  basePriceCop: number;
  imagePath?: string | null;
  imagePaths?: string[];
  imageEmoji: string;
  gradientClass: string;
  bestSeller: boolean;
  active: boolean;
  categories: string[];
  colors: string[];
  styles: string[];
  tags: string[];
  optionGroups: unknown[];
}

/**
 * ProductService - Handles all product-related business logic
 * Following OOP design patterns with separation of concerns
 */
export class ProductService {
  /**
   * Parse JSON string fields from database to arrays/objects
   */
  private static parseProduct(product: PrismaProductRecord): ProductWithParsedFields {
    return {
      ...product,
      categories: JSON.parse(product.categories),
      colors: JSON.parse(product.colors),
      styles: JSON.parse(product.styles),
      tags: JSON.parse(product.tags),
      imagePaths: JSON.parse(product.imagePaths || "[]"),
      optionGroups: JSON.parse(product.optionGroups),
    };
  }

  private static async withSharedIncludes(product: ProductWithParsedFields): Promise<ProductWithParsedFields> {
    const sharedGroups = await IncludeService.buildOptionGroups(product.categories);

    if (sharedGroups.length === 0) {
      return product;
    }

    const paletteGroup = (product.optionGroups as { key?: string }[]).filter((group) => group.key === "palette");

    return {
      ...product,
      optionGroups: [...paletteGroup, ...sharedGroups],
    };
  }

  /**
   * Get all active products with optional filtering
   */
  static async getAllProducts(filters?: ProductFilters): Promise<ProductWithParsedFields[]> {
    const where: Record<string, unknown> = {
      active: filters?.active !== undefined ? filters.active : true,
    };

    if (filters?.bestSeller !== undefined) {
      where.bestSeller = filters.bestSeller;
    }

    if (filters?.search) {
      where.OR = [
        { nameEs: { contains: filters.search } },
        { nameEn: { contains: filters.search } },
        { descriptionEs: { contains: filters.search } },
        { descriptionEn: { contains: filters.search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { bestSeller: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Parse JSON fields and apply array-based filters
    let parsedProducts = products.map(this.parseProduct);

    if (filters?.category) {
      parsedProducts = parsedProducts.filter((p: ProductWithParsedFields) => 
        p.categories.includes(filters.category!)
      );
    }

    if (filters?.color) {
      parsedProducts = parsedProducts.filter((p: ProductWithParsedFields) => 
        p.colors.includes(filters.color!)
      );
    }

    if (filters?.style) {
      parsedProducts = parsedProducts.filter((p: ProductWithParsedFields) => 
        p.styles.includes(filters.style!)
      );
    }

    if (filters?.tag) {
      parsedProducts = parsedProducts.filter((p: ProductWithParsedFields) => 
        p.tags.includes(filters.tag!)
      );
    }

    return parsedProducts;
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<ProductWithParsedFields | null> {
    try {
      console.log("ProductService.getProductBySlug:", slug, "prisma:", typeof prisma);
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (!product) {
        return null;
      }

      return this.withSharedIncludes(this.parseProduct(product));
    } catch (error) {
      console.error("ProductService.getProductBySlug error:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<ProductWithParsedFields | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return this.withSharedIncludes(this.parseProduct(product));
  }

  /**
   * Get best seller products
   */
  static async getBestSellers(limit: number = 8): Promise<ProductWithParsedFields[]> {
    const products = await prisma.product.findMany({
      where: {
        bestSeller: true,
        active: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(products.map((product) => this.withSharedIncludes(this.parseProduct(product))));
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<ProductWithParsedFields[]> {
    return this.getAllProducts({ category });
  }

  /**
   * Search products
   */
  static async searchProducts(query: string): Promise<ProductWithParsedFields[]> {
    return this.getAllProducts({ search: query });
  }

  /**
   * Check if product exists and is active
   */
  static async isProductAvailable(slug: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { active: true },
    });

    return product?.active ?? false;
  }

  /**
   * Get multiple products by slugs (useful for cart/order operations)
   */
  static async getProductsBySlugs(slugs: string[]): Promise<ProductWithParsedFields[]> {
    const products = await prisma.product.findMany({
      where: {
        slug: { in: slugs },
        active: true,
      },
    });

    return products.map(this.parseProduct);
  }

  static async createProduct(input: ProductUpsertInput): Promise<ProductWithParsedFields> {
    const product = await prisma.product.create({
      data: {
        ...input,
        longDescriptionEs: input.longDescriptionEs ?? null,
        longDescriptionEn: input.longDescriptionEn ?? null,
        imagePath: input.imagePath ?? null,
        imagePaths: JSON.stringify(input.imagePaths ?? (input.imagePath ? [input.imagePath] : [])),
        categories: JSON.stringify(input.categories),
        colors: JSON.stringify(input.colors),
        styles: JSON.stringify(input.styles),
        tags: JSON.stringify(input.tags),
        optionGroups: JSON.stringify(input.optionGroups),
      },
    });

    return this.parseProduct(product);
  }

  static async updateProduct(
    id: string,
    input: ProductUpsertInput,
  ): Promise<ProductWithParsedFields> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...input,
        longDescriptionEs: input.longDescriptionEs ?? null,
        longDescriptionEn: input.longDescriptionEn ?? null,
        imagePath: input.imagePath ?? null,
        imagePaths: JSON.stringify(input.imagePaths ?? (input.imagePath ? [input.imagePath] : [])),
        categories: JSON.stringify(input.categories),
        colors: JSON.stringify(input.colors),
        styles: JSON.stringify(input.styles),
        tags: JSON.stringify(input.tags),
        optionGroups: JSON.stringify(input.optionGroups),
      },
    });

    return this.parseProduct(product);
  }

  static async deleteProduct(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        active: false,
        bestSeller: false,
      },
    });
  }
}
