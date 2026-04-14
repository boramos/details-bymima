import { NextResponse } from "next/server";
import { ConfigService } from "@/services/ConfigService";

export async function GET() {
  try {
    const config = await ConfigService.getMany([
      "passport_price_usd",
      "free_delivery_threshold_usd",
      "delivery_standard_usd",
      "delivery_tomorrow_usd",
      "delivery_today_usd",
      "delivery_pickup_usd",
      "tax_rate",
      "sandbox_mode",
    ]);

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load configuration" },
      { status: 500 }
    );
  }
}
