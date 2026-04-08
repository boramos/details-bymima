import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "@/services/AddressService";
import { AddressUpdateSchema } from "@/validators/api";
import { ZodError } from "zod";

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
    const validated = AddressUpdateSchema.parse(body);
    
    await AddressService.updateAddress((await params).id, session.user.id, validated);
    
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

    console.error(`[API] PUT /api/addresses/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update address" },
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

    await AddressService.deleteAddress((await params).id, session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(`[API] DELETE /api/addresses/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
