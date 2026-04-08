import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "@/services/AddressService";
import { AddressCreateSchema, AddressUpdateSchema } from "@/validators/api";
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

    const addresses = await AddressService.getAddressesByUser(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("[API] GET /api/addresses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
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
    const validated = AddressCreateSchema.parse(body);
    
    const address = await AddressService.createAddress(session.user.id, validated);
    
    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/addresses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create address" },
      { status: 500 }
    );
  }
}
