import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AutoBuyService } from "@/services/AutoBuyService";

export async function POST(
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

    await AutoBuyService.pauseAutoBuy((await params).id, session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(`[API] POST /api/autobuy/${(await params).id}/pause error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to pause auto-buy" },
      { status: 500 }
    );
  }
}
