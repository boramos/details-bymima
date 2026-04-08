import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AutoBuyService } from "@/services/AutoBuyService";
import { AutoBuyUpdateSchema } from "@/validators/api";
import { ZodError } from "zod";

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

    const autoBuy = await AutoBuyService.getAutoBuyById((await params).id, session.user.id);
    
    if (!autoBuy) {
      return NextResponse.json(
        { success: false, error: "Auto-buy not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: autoBuy,
    });
  } catch (error) {
    console.error(`[API] GET /api/autobuy/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auto-buy" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const validated = AutoBuyUpdateSchema.parse(body);
    
    await AutoBuyService.updateAutoBuy((await params).id, session.user.id, {
      ...validated,
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
    });
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error(`[API] PUT /api/autobuy/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update auto-buy" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await AutoBuyService.deleteAutoBuy((await params).id, session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(`[API] DELETE /api/autobuy/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete auto-buy" },
      { status: 500 }
    );
  }
}
