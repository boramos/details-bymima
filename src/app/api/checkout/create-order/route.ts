import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

import { buildCheckoutQuote, type CheckoutDeliveryMethod, type CheckoutDraftItem } from "@/lib/checkout";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { OrderService } from "@/services/OrderService";
import { ProductService } from "@/services/ProductService";
import { PassportService } from "@/services/PassportService";

const CreateOrderBody = z.object({
  locale: z.enum(["es", "en"]).optional(),
  items: z.array(
    z.object({
      productSlug: z.string().min(1),
      quantity: z.number().int().min(1),
      selections: z.any(),
      note: z.string().optional(),
    }),
  ).min(1),
  deliveryMethod: z.enum(["standard", "tomorrow", "today", "pickup"]),
  hasPassport: z.boolean().optional(),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.enum(["card", "paypal"]),
  stripeSessionId: z.string().optional(),
  paypalOrderId: z.string().optional(),
  notes: z.string().optional(),
  deliveryAddressId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const body = CreateOrderBody.parse(raw);
    const locale: Locale = body.locale ?? DEFAULT_LOCALE;

    const hasActivePassport = await PassportService.isPassportActive(session.user.id);

    const quote = await buildCheckoutQuote({
      locale,
      items: body.items as CheckoutDraftItem[],
      deliveryMethod: body.deliveryMethod as CheckoutDeliveryMethod,
      includePassport: body.hasPassport ?? false,
      hasActivePassport,
    });

    const orderItems = await Promise.all(
      quote.items.map(async (item) => {
        const dbProduct = await ProductService.getProductBySlug(item.productSlug);
        if (!dbProduct) {
          throw new Error(`Product not found: ${item.productSlug}`);
        }

        const draftItem = body.items.find((d) => d.productSlug === item.productSlug);

        return {
          productId: dbProduct.id,
          productSlug: item.productSlug,
          productName: item.productName,
          quantity: item.quantity,
          unitPriceCop: Math.round(item.unitPrice * 100),
          selections: draftItem?.selections ?? {},
          note: draftItem?.note,
        };
      }),
    );

    const deliveryMethodMap: Record<string, string> = {
      standard: "STANDARD",
      tomorrow: "TOMORROW",
      today: "TODAY",
      pickup: "PICKUP",
    };

    const order = await OrderService.createOrder({
      userId: session.user.id,
      customerName: body.customer.name,
      customerEmail: body.customer.email,
      customerPhone: body.customer.phone ?? "",
      items: orderItems,
      subtotalCop: Math.round(quote.subtotal * 100),
      taxCop: Math.round(quote.taxes * 100),
      deliveryFeeCop: Math.round(quote.deliveryFee * 100),
      discountCop: 0,
      totalCop: Math.round(quote.total * 100),
      deliveryMethod: deliveryMethodMap[body.deliveryMethod] ?? "STANDARD",
      deliveryAddressId: body.deliveryAddressId,
      paymentMethod: body.paymentMethod === "card" ? "CARD" : "PAYPAL",
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[API] POST /api/checkout/create-order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    );
  }
}
