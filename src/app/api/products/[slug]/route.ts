import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/ProductService";
import { ProductSlugSchema } from "@/validators/product";
import { ZodError } from "zod";

/**
 * GET /api/products/[slug]
 * Fetch a single product by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Validate slug parameter
    const validatedParams = ProductSlugSchema.parse(params);
    
    // Fetch product using service layer
    const product = await ProductService.getProductBySlug(validatedParams.slug);
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid slug parameter",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error(`[API] GET /api/products/${(await params).slug} error:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
