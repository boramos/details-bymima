import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AutoBuyService } from "@/services/AutoBuyService";
import { AutoBuyCreateSchema, AutoBuyUpdateSchema } from "@/validators/api";
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

    const autoBuys = await AutoBuyService.getAutoBuysByUser(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: autoBuys,
    });
  } catch (error) {
    console.error("[API] GET /api/autobuy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auto-buys" },
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
    const validated = AutoBuyCreateSchema.parse(body);
    
    const autoBuy = await AutoBuyService.createAutoBuy({
      userId: session.user.id,
      ...validated,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
    });
    
    return NextResponse.json({
      success: true,
      data: autoBuy,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/autobuy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create auto-buy" },
      { status: 500 }
    );
  }
}
