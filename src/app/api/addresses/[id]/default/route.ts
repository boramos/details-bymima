import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "@/services/AddressService";

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

    const { id } = await params;
    await AddressService.setDefaultAddress(id, session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] POST /api/addresses/${id}/default error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to set default address" },
      { status: 500 }
    );
  }
}
