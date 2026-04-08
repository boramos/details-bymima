import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { PassportService } from "@/services/PassportService";
import { PassportCreateSchema } from "@/validators/api";
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

    const passport = await PassportService.getPassportByUser(session.user.id);
    const isActive = await PassportService.isPassportActive(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: passport,
      isActive,
    });
  } catch (error) {
    console.error("[API] GET /api/passport error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch passport" },
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
    const validated = PassportCreateSchema.parse(body);
    
    const passport = await PassportService.createPassport(
      session.user.id,
      validated.pricePaidCop,
      validated.durationMonths
    );
    
    return NextResponse.json({
      success: true,
      data: passport,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/passport error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create passport" },
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

    await PassportService.cancelPassport(session.user.id);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[API] DELETE /api/passport error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel passport" },
      { status: 500 }
    );
  }
}
