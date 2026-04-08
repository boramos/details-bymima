import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/OrderService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await OrderService.getOrderById((await params).id, session.user.id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(`[API] GET /api/orders/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
