import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/OrderService";
import { OrderCreateSchema } from "@/validators/api";
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

    const orders = await OrderService.getOrdersByUser(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("[API] GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
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
    const validated = OrderCreateSchema.parse(body);
    
    const order = await OrderService.createOrder({
      userId: session.user.id,
      ...validated,
      scheduledDeliveryDate: validated.scheduledDeliveryDate 
        ? new Date(validated.scheduledDeliveryDate)
        : undefined,
    });
    
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
