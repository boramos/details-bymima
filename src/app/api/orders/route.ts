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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    const now = new Date();

    if (filter === "3months") {
      dateFilter = { gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) };
    } else if (filter === "1year") {
      dateFilter = { gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
    } else if (filter === "custom" && from) {
      dateFilter = {
        gte: new Date(from),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const orders = await OrderService.getOrdersByUser(session.user.id, dateFilter);
    
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
