import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/ProductService";
import { ProductQuerySchema } from "@/validators/product";
import { ZodError } from "zod";

/**
 * GET /api/products
 * Fetch all products with optional filtering
 * 
 * Query params:
 * - category: Filter by category
 * - color: Filter by color
 * - style: Filter by style
 * - tag: Filter by tag
 * - bestSeller: Filter best sellers (true/false)
 * - active: Filter active products (true/false, default: true)
 * - search: Search in name/description
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert URLSearchParams to plain object
    const queryObject = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = ProductQuerySchema.parse(queryObject);
    
    // Fetch products using service layer
    const products = await ProductService.getAllProducts(validatedQuery);
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("[API] GET /api/products error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
