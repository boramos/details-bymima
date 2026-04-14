import { NextResponse } from "next/server";
import { sendOrderReceipt } from "@/lib/email";
import type { OrderReceiptSnapshot } from "@/lib/receipt-types";

export async function POST(request: Request) {
  let body: OrderReceiptSnapshot;

  try {
    body = (await request.json()) as OrderReceiptSnapshot;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.customerEmail || !body.orderId) {
    return NextResponse.json({ error: "customerEmail and orderId are required." }, { status: 400 });
  }

  const result = await sendOrderReceipt(body);

  if (!result.sent) {
    return NextResponse.json({ sent: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({ sent: true });
}
