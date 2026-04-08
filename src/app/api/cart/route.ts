import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/services/CartService";
import { CartItemCreateSchema, CartItemUpdateSchema } from "@/validators/api";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const items = await CartService.getCartItems(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("[API] GET /api/cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = CartItemCreateSchema.parse(body);
    
    const item = await CartService.addToCart(
      session.user.id,
      validated.productId,
      validated.quantity,
      validated.selections,
      validated.note
    );
    
    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await CartService.clearCart(session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[API] DELETE /api/cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
