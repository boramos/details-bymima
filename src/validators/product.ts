import { z } from "zod";

/**
 * Validation schemas for Product API endpoints
 */

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  tag: z.string().optional(),
  bestSeller: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  active: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  search: z.string().optional(),
});

export const ProductSlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type ProductSlugInput = z.infer<typeof ProductSlugSchema>;
