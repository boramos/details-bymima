import { prisma } from "@/lib/prisma";
import type { Product as PrismaProduct } from "@prisma/client";

export interface ProductFilters {
  category?: string;
  color?: string;
  style?: string;
  tag?: string;
  bestSeller?: boolean;
  active?: boolean;
  search?: string;
}

export interface ProductWithParsedFields extends Omit<PrismaProduct, 'categories' | 'colors' | 'styles' | 'tags' | 'optionGroups'> {
  categories: string[];
  colors: string[];
  styles: string[];
  tags: string[];
  optionGroups: any[];
}

/**
 * ProductService - Handles all product-related business logic
 * Following OOP design patterns with separation of concerns
 */
export class ProductService {
  /**
   * Parse JSON string fields from database to arrays/objects
   */
  private static parseProduct(product: PrismaProduct): ProductWithParsedFields {
    return {
      ...product,
      categories: JSON.parse(product.categories),
      colors: JSON.parse(product.colors),
      styles: JSON.parse(product.styles),
      tags: JSON.parse(product.tags),
      optionGroups: JSON.parse(product.optionGroups),
    };
  }

  /**
   * Get all active products with optional filtering
   */
  static async getAllProducts(filters?: ProductFilters): Promise<ProductWithParsedFields[]> {
    const where: any = {
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
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return null;
    }

    return this.parseProduct(product);
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

    return this.parseProduct(product);
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

    return products.map(this.parseProduct);
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
}
